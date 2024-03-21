import type { NextApiRequest, NextApiResponse } from 'next';
import admin from '../../config/firebaseAdmin';
import axios from 'axios';
import { extrairDiaDaSemana, gerarPresencasParaAluno, normalizeName } from '@/utils/Constants';
const db = admin.database();

export default async function submitForm(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const alunos = Array.isArray(req.body) ? req.body : [req.body];
  const resultados = [];

  for (const alunoData of alunos) {
    const { modalidade, turmaSelecionada, aluno } = alunoData;

     // Gerar presenças aqui
     const diaDaSemana = extrairDiaDaSemana(turmaSelecionada);
     aluno.presencas = gerarPresencasParaAluno(diaDaSemana);

    if (!turmaSelecionada) {
      resultados.push({ sucesso: false, erro: 'Nome da turma não fornecido', aluno });
      continue;
    }

    try {
      const turmaRef = db.ref(`modalidades/${modalidade}/turmas`).orderByChild('nome_da_turma').equalTo(turmaSelecionada);
      const snapshot = await turmaRef.once('value');

      if (!snapshot.exists()) {
        resultados.push({ sucesso: false, erro: 'Turma não encontrada.', aluno });
        continue;
      }

      const turmaData = snapshot.val();
      const turmaKey = Object.keys(turmaData)[0];
      const turma = turmaData[turmaKey];

      if (turma.capacidade_atual_da_turma >= turma.capacidade_maxima_da_turma) {
        resultados.push({ sucesso: false, erro: `Não há vagas disponíveis na turma ${turma.nome_da_turma}.`, aluno });
        continue;
      }

      // Verificação de aluno duplicado
      const alunosSnapshot = await db.ref(`modalidades/${modalidade}/turmas/${turmaKey}/alunos`).once('value');
    const alunosExistem = alunosSnapshot.val() || {};

    const nomeAlunoNormalizado = normalizeName(aluno.nome);
    console.log(`Nome normalizado do aluno a ser inserido: ${nomeAlunoNormalizado}`); // Debug

    const alunoDuplicado = Object.values(alunosExistem).some((alunoExistente: any) => {
        const nomeExistenteNormalizado = normalizeName(alunoExistente.nome);
        console.log(`Comparando com: ${nomeExistenteNormalizado}`); // Debug
        return nomeExistenteNormalizado === nomeAlunoNormalizado;
    });

    if (alunoDuplicado) {
        resultados.push({ sucesso: false, erro: 'Aluno já cadastrado nesta turma.', aluno });
        continue;
    }

      const novoIdAluno = Object.keys(alunosExistem).length + 1;
      aluno.id = novoIdAluno;

      await db.ref(`modalidades/${modalidade}/turmas/${turmaKey}/alunos/${novoIdAluno}`).set(aluno);
      await db.ref(`modalidades/${modalidade}/turmas/${turmaKey}`).update({
        capacidade_atual_da_turma: turma.capacidade_atual_da_turma + 1,
        contadorAlunos: novoIdAluno
      });

      resultados.push({ sucesso: true, aluno });
    } catch (erro) {
      if (axios.isAxiosError(erro)) {
        // do something
        // or just re-throw the error
        resultados.push({ sucesso: false, erro: erro.toString(), aluno });
      } 
      
    }
  }

  return res.status(200).json({ resultados });
}
