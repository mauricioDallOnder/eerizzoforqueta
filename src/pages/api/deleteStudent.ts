import { NextApiRequest, NextApiResponse } from 'next';
import admin from '../../config/firebaseAdmin';

const db = admin.database();

async function removerAluno(modalidade: string, nomeDaTurma: string, identificadorUnico: string): Promise<void> {
  const turmaRef = db.ref(`modalidades/${modalidade}/turmas`).orderByChild('nome_da_turma').equalTo(nomeDaTurma);
  const snapshot = await turmaRef.once('value');
  if (snapshot.exists()) {
    const turmaData = snapshot.val();
    const turmaKey = Object.keys(turmaData)[0];
    const turma = turmaData[turmaKey];
    
    const alunoKey = Object.keys(turma.alunos).find(key => turma.alunos[key].informacoesAdicionais.IdentificadorUnico === identificadorUnico);

    if (alunoKey) {
      await db.ref(`modalidades/${modalidade}/turmas/${turmaKey}/alunos/${alunoKey}`).remove();

      // Atualizar o contador de alunos se necessário
      if (turma.contadorAlunos && turma.contadorAlunos > 0) {
        const novoContadorAlunos = turma.contadorAlunos - 1;
        await db.ref(`modalidades/${modalidade}/turmas/${turmaKey}`).update({ contadorAlunos: novoContadorAlunos });
      }
    } else {
      throw new Error('Aluno não encontrado');
    }
  } else {
    throw new Error('Turma não encontrada');
  }
}

export default async function deleteStudent(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', 'DELETE');
    return res.status(405).end('Method Not Allowed');
  }

  const { alunoId, modalidade, nomeDaTurma } = req.body;

  if (!alunoId || !modalidade || !nomeDaTurma) {
    return res.status(400).json({ error: 'Dados incompletos para excluir o aluno.' });
  }

  try {
    await removerAluno(modalidade, nomeDaTurma, alunoId);
    return res.status(200).json({ message: 'Aluno removido com sucesso.' });
  } catch (error) {
    console.error('Erro ao remover aluno', error);
    return res.status(500).json({ error: 'Erro ao remover aluno' });
  }
}
