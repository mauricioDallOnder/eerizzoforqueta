// pages/api/updateAttendance.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import admin from '../../config/firebaseAdmin';
import { Turma } from '@/interface/interfaces';

export default async function updateAttendance(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    try {
      const { modalidade, nomeDaTurma, alunoNome, presencas } = req.body;

      // Caminho para as turmas da modalidade
      const turmasRef = admin.database().ref(`modalidades/${modalidade}/turmas`);
      const snapshot = await turmasRef.once('value');
      const turmas: Turma[] = snapshot.val(); 
      // Encontrar a turma e o aluno pelo nome
      let turmaIndex = -1;
      let alunoIndex = -1;
      turmas.forEach((turma, idx) => {
        if (turma.nome_da_turma === nomeDaTurma) {
          turmaIndex = idx;
          turma!.alunos!.forEach((aluno, index) => {
            if (aluno.nome === alunoNome) {
              alunoIndex = index;
            }
          });
        }
      });

      // Se não encontrar a turma ou o aluno, retorna erro
      if (turmaIndex === -1 || alunoIndex === -1) {
        return res.status(404).json({ error: 'Turma ou aluno não encontrado' });
      }

      // Referência para as presenças do aluno
      const presencasRef = turmasRef.child(`${turmaIndex}/alunos/${alunoIndex}/presencas`);

      // Atualizar as presenças do aluno
      await presencasRef.update(presencas);

      return res.status(200).json({ message: 'Presença atualizada com sucesso' });
    } catch (error) {
      console.error('Erro ao atualizar presença', error);
      return res.status(500).json({ error: 'Erro ao atualizar presença' });
    }
  } else {
    res.setHeader('Allow', 'PUT');
    res.status(405).end('Method Not Allowed');
  }
}
