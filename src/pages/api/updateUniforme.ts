import type { NextApiRequest, NextApiResponse } from 'next';
import admin from '../../config/firebaseAdmin';

// Supondo que Turma e Aluno estejam corretamente definidos em '@/interface/interfaces'
import { Turma } from '@/interface/interfaces';

export default async function updateUniforme(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    try {
      const { modalidade, nomeDaTurma, alunoNome, hasUniforme } = req.body;
      
      // Acesso ao caminho das turmas na modalidade especificada
      const turmasRef = admin.database().ref(`modalidades/${modalidade}/turmas`);
      const snapshot = await turmasRef.once('value');
      const turmas = snapshot.val();

      if (!turmas) {
        return res.status(404).json({ error: 'Modalidade ou turmas não encontradas' });
      }

      let found = false;

      // Iteração para encontrar a turma e o aluno especificado
      Object.keys(turmas).forEach(key => {
        const turma = turmas[key];
        if (turma.nome_da_turma === nomeDaTurma) {
          const alunos = turma.alunos || [];
          const alunoIndex = alunos.findIndex((aluno: { nome: any; }) => aluno.nome === alunoNome);
          if (alunoIndex !== -1) {
            const uniformeRef = turmasRef.child(`${key}/alunos/${alunoIndex}/informacoesAdicionais/hasUniforme`);
            uniformeRef.set(hasUniforme);
            found = true;
          }
        }
      });

      if (!found) {
        return res.status(404).json({ error: 'Turma ou aluno não encontrado' });
      }

      return res.status(200).json({ message: 'Informação de uniforme atualizada com sucesso' });
    } catch (error) {
      console.error('Erro ao atualizar informação de uniforme', error);
      return res.status(500).json({ error: 'Erro ao atualizar informação de uniforme' });
    }
  } else {
    res.setHeader('Allow', 'PUT');
    res.status(405).end('Method Not Allowed');
  }
}
