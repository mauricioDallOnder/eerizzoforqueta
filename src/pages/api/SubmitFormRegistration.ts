import type { NextApiRequest, NextApiResponse } from 'next';
import admin from '../../config/firebaseAdmin';
import { extrairDiaDaSemana, gerarPresencasParaAluno } from '@/utils/Constants'; // Certifique-se de que este é o caminho correto

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
        resultados.push({ sucesso: false, erro: 'Não há vagas disponíveis nesta turma.', aluno });
        continue;
      }

      const novoIdAluno = turma.contadorAlunos ? turma.contadorAlunos + 1 : 1;
      aluno.id = novoIdAluno; // Atribui um ID numérico ao aluno

      await db.ref(`modalidades/${modalidade}/turmas/${turmaKey}/alunos/${novoIdAluno}`).set(aluno);
      await db.ref(`modalidades/${modalidade}/turmas/${turmaKey}`).update({
        capacidade_atual_da_turma: turma.capacidade_atual_da_turma + 1,
        contadorAlunos: novoIdAluno
      });

      resultados.push({ sucesso: true, aluno });
    } catch (erro) {
      resultados.push({ sucesso: false, erro: erro, aluno });
    }
  }

  return res.status(200).json({ resultados });
}

