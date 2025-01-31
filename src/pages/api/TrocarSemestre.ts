// pages/api/updatePresencas.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import admin from '../../config/firebaseAdmin';

// Importe as funções que você precisa
import {
  extrairDiaDaSemana,
  gerarPresencasParaAluno,
  gerarPresencasParaAlunoSemestre,
} from '@/utils/Constants';

const db = admin.database();

/**
 * Exemplo de API que pode usar EITHER "gerarPresencasParaAluno" ou "gerarPresencasParaAlunoSemestre"
 * dependendo do body enviado.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  // Exemplo: se o frontend mandar { modalidade, modo: "semestre"|"corrente", semestre: "primeiro"|"segundo", ano: number }
  const { modalidade, modo, semestre, ano } = req.body;

  if (!modalidade) {
    return res.status(400).json({ error: 'Nenhuma modalidade foi recebida.' });
  }

  try {
    console.log('Processando modalidade:', modalidade.nome);

    for (const turma of modalidade.turmas) {
      console.log('Processando turma:', turma.nome_da_turma);

      // extrai dia da semana do nome_da_turma
      const diaDaSemana = extrairDiaDaSemana(turma.nome_da_turma);
      console.log('Dia da semana extraído:', diaDaSemana);

      // Escolhe qual função usar dependendo do "modo"
      let novasPresencas;
      if (modo === 'semestre' && semestre && ano) {
        // Gera presenças fixas pro "semestre"
        novasPresencas = gerarPresencasParaAlunoSemestre(diaDaSemana, semestre, ano);
      } else {
        // Gera presenças com ano corrente e base no mesAtual <7 ou >=7
        novasPresencas = gerarPresencasParaAluno(diaDaSemana);
      }

      // Buscar a turma no Firebase
      const turmaSnapshot = await db
        .ref(`modalidades/${modalidade.nome}/turmas`)
        .orderByChild('nome_da_turma')
        .equalTo(turma.nome_da_turma)
        .once('value');
      const turmaData = turmaSnapshot.val();

      if (!turmaData) {
        console.error('Turma não encontrada:', turma.nome_da_turma);
        continue;
      }

      const turmaKey = Object.keys(turmaData)[0];

      // Atualiza cada aluno
      for (const aluno of turma.alunos) {
        if (aluno && aluno.id !== undefined) {
          console.log('Atualizando presenças para o aluno:', aluno.nome, 'ID:', aluno.id);
          await db.ref(`modalidades/${modalidade.nome}/turmas/${turmaKey}/alunos/${aluno.id}`)
            .update({ presencas: novasPresencas });
        }
      }
    }

    res.status(200).json({ message: "Presenças atualizadas com sucesso!" });
  } catch (error) {
    console.error('Erro ao atualizar presenças:', error);
    res.status(500).json({ error: 'Erro ao atualizar presenças' });
  }
}
