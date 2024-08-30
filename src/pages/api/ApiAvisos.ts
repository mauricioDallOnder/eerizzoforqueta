import type { NextApiRequest, NextApiResponse } from 'next';
import admin from '../../config/firebaseAdmin';

export default async function handleAvisos(req: NextApiRequest, res: NextApiResponse) {
  const { alunoNome, modalidade, nomeDaTurma } = req.body;

  // Acesso ao caminho das turmas na modalidade especificada
  const turmasRef = admin.database().ref(`modalidades/${modalidade}/turmas`);
  const snapshot = await turmasRef.once('value');
  const turmas = snapshot.val();

  if (!turmas) {
    return res.status(404).json({ error: 'Modalidade ou turmas não encontradas' });
  }

  let found = false;
  let alunoAvisoPath = '';

  // Iteração para encontrar a turma e o aluno especificado
  Object.keys(turmas).forEach(key => {
    const turma = turmas[key];
    if (turma.nome_da_turma === nomeDaTurma) {
      const alunos = turma.alunos || [];
      const alunoIndex = alunos.findIndex((aluno: { nome: any; }) => aluno.nome === alunoNome);
      if (alunoIndex !== -1) {
        alunoAvisoPath = `${key}/alunos/${alunoIndex}/avisos`;
        found = true;
      }
    }
  });

  if (!found) {
    return res.status(404).json({ error: 'Turma ou aluno não encontrado' });
  }

  const textAvisoRef = turmasRef.child(`${alunoAvisoPath}/textaviso`);
  const dataavisoAvisoRef = turmasRef.child(`${alunoAvisoPath}/dataaviso`);
  const IsActiveAvisoRef = turmasRef.child(`${alunoAvisoPath}/IsActive`);

  try {
    if (req.method === 'POST' || req.method === 'PUT') {
      const { textaviso, dataaviso, IsActive } = req.body;

      await textAvisoRef.set(textaviso);
      await dataavisoAvisoRef.set(dataaviso);
      await IsActiveAvisoRef.set(IsActive);

      return res.status(200).json({ message: 'Informação de aviso atualizada com sucesso' });
    } else if (req.method === 'DELETE') {
      await textAvisoRef.remove();
      await dataavisoAvisoRef.remove();
      await IsActiveAvisoRef.remove();

      return res.status(200).json({ message: 'Aviso deletado com sucesso' });
    } else {
      res.setHeader('Allow', ['POST', 'PUT', 'DELETE']);
      res.status(405).end('Method Not Allowed');
    }
  } catch (error) {
    console.error('Erro ao manipular aviso', error);
    return res.status(500).json({ error: 'Erro ao manipular aviso' });
  }
}
