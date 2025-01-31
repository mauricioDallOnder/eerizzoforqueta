import type { NextApiRequest, NextApiResponse } from 'next';
import admin from '../../config/firebaseAdmin';
import { gerarPresencasParaAlunoSemestre, extrairDiaDaSemana } from '@/utils/Constants';

const db = admin.database();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const { ano, semestre, modalidade } = req.body;

  if (!modalidade || !ano || !semestre) {
    return res.status(400).json({ error: 'Dados incompletos. Ex: { ano, semestre, modalidade }' });
  }

  try {
    console.log('Processando modalidade:', modalidade.nome);

    for (const turma of modalidade.turmas) {
      console.log('Processando turma:', turma.nome_da_turma);

      // extrai dia da semana do nome_da_turma
      const diaDaSemana = extrairDiaDaSemana(turma.nome_da_turma);
      console.log('Dia da semana:', diaDaSemana);

      // Aqui geramos presenças, definindo jan..jun se "primeiro", jul..dez se "segundo"
      // e usando o "ano" que veio no body
      const novasPresencas = gerarPresencasParaAlunoSemestre(
        diaDaSemana,
        semestre,  // "primeiro" ou "segundo"
        ano        // ex: 2024, 2025 etc
      );

      const turmaSnapshot = await db.ref(`modalidades/${modalidade.nome}/turmas`)
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
          console.log('Atualizando presenças para o aluno:', aluno.nome, 'com ID:', aluno.id);
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
