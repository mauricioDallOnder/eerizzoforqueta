import type { NextApiRequest, NextApiResponse } from 'next';
import admin from '../../config/firebaseAdmin';
import { Aluno } from '@/interface/interfaces';

const db = admin.database();

async function atualizarTurma(modalidade: string, nomeTurma: string, aluno: Aluno | null, incremento: number) {
  const turmaRef = db.ref(`modalidades/${modalidade}/turmas`).orderByChild('nome_da_turma').equalTo(nomeTurma);
  const snapshot = await turmaRef.once('value');
  if (snapshot.exists()) {
    const turmaData = snapshot.val();
    const turmaKey = Object.keys(turmaData)[0];
    const turma = turmaData[turmaKey];

    if (incremento > 0 && aluno !== null) { // Adiciona aluno
      const novoIdAluno = turma.contadorAlunos ? turma.contadorAlunos + 1 : 1;
      aluno.id = novoIdAluno;
      turma.alunos = turma.alunos || {};
      turma.alunos[novoIdAluno] = aluno;
    } // Não precisa de um else aqui, pois não estamos tratando remoção nesta parte

    await db.ref(`modalidades/${modalidade}/turmas/${turmaKey}`).update({
      alunos: turma.alunos,
      contadorAlunos: turma.contadorAlunos ? turma.contadorAlunos + incremento : 1,
      capacidade_atual_da_turma: turma.capacidade_atual_da_turma + incremento
    });
  }
}

async function encontrarEremoverAluno(modalidade: string, nomeDaTurma: string, alunoNome: string): Promise<Aluno | null> {
  const turmaRef = db.ref(`modalidades/${modalidade}/turmas`).orderByChild('nome_da_turma').equalTo(nomeDaTurma);
  const snapshot = await turmaRef.once('value');
  if (snapshot.exists()) {
    const turmaData = snapshot.val();
    const turmaKey = Object.keys(turmaData)[0];
    const turma = turmaData[turmaKey];

    for (const [id, alunoObject] of Object.entries(turma.alunos || {})) {
      // Assumimos que alunoObject é do tipo Aluno com uma asserção de tipo
      const aluno = alunoObject as Aluno;
      if (aluno.nome === alunoNome) {
        delete turma.alunos[id];
        await db.ref(`modalidades/${modalidade}/turmas/${turmaKey}/alunos`).set(turma.alunos || {});
        // Agora que garantimos para o TypeScript que aluno é do tipo Aluno, podemos espalhá-lo sem erro
        return { ...aluno, id: parseInt(id) };
      }
    }
  }
  return null;
}

export default async function moveStudent(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const { alunoNome, modalidadeOrigem, nomeDaTurmaOrigem, modalidadeDestino, nomeDaTurmaDestino } = req.body;
    const alunoDados = await encontrarEremoverAluno(modalidadeOrigem, nomeDaTurmaOrigem, alunoNome) as Aluno | null;

    if (alunoDados) {
      // Agora você pode usar alunoDados com segurança porque o tipo foi asserido para Aluno | null
      await atualizarTurma(modalidadeDestino, nomeDaTurmaDestino, alunoDados, 1);
      await atualizarTurma(modalidadeOrigem, nomeDaTurmaOrigem, null, -1);
    } else {
      return res.status(404).json({ error: 'Aluno não encontrado na turma de origem' });
    }
  } catch (error) {
    console.error('Erro ao mover aluno', error);
    return res.status(500).json({ error: 'Erro ao mover aluno' });
  }
}
