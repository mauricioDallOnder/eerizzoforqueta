import type { NextApiRequest, NextApiResponse } from 'next';
import admin from '../../config/firebaseAdmin';
import { Aluno } from '@/interface/interfaces';

const db = admin.database();

async function atualizarTurma(modalidade: string, nomeTurma: string, alunos: Aluno[], incremento: number) {
  const turmaRef = db.ref(`modalidades/${modalidade}/turmas`).orderByChild('nome_da_turma').equalTo(nomeTurma);
  const snapshot = await turmaRef.once('value');
  if (!snapshot.exists()) {
    throw new Error(`Turma ${nomeTurma} não encontrada em modalidade ${modalidade}`);
  }

  const turmaData = snapshot.val();
  const turmaKey = Object.keys(turmaData)[0];
  const turma = turmaData[turmaKey];

  // Initialize if undefined
  turma.alunos = turma.alunos || {};
  alunos.forEach(aluno => {
    const novoIdAluno = turma.contadorAlunos ? ++turma.contadorAlunos : 1;
    aluno.id = novoIdAluno;
    turma.alunos[novoIdAluno] = aluno;
  });

  await db.ref(`modalidades/${modalidade}/turmas/${turmaKey}`).update({
    alunos: turma.alunos,
    contadorAlunos: turma.contadorAlunos,
    capacidade_atual_da_turma: turma.capacidade_atual_da_turma + incremento
  });
}

async function encontrarEremoverAluno(modalidade: string, nomeDaTurma: string, alunoNome: string): Promise<Aluno | null> {
  const turmaRef = db.ref(`modalidades/${modalidade}/turmas`).orderByChild('nome_da_turma').equalTo(nomeDaTurma);
  const snapshot = await turmaRef.once('value');
  if (!snapshot.exists()) {
    return null;
  }

  const turmaData = snapshot.val();
  const turmaKey = Object.keys(turmaData)[0];
  const turma = turmaData[turmaKey];

  for (const [id, alunoObject] of Object.entries(turma.alunos || {})) {
    const aluno = alunoObject as Aluno;
    if (aluno.nome === alunoNome) {
      delete turma.alunos[id];
      await db.ref(`modalidades/${modalidade}/turmas/${turmaKey}/alunos`).set(turma.alunos || {});
      return { ...aluno, id: parseInt(id) };
    }
  }
  return null;
}

export default async function moveStudents(req: NextApiRequest, res: NextApiResponse) {
  console.log("Recebido na API:", req.body);
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const { alunosNomes, alunosModalidadesOrigem, alunosTurmasOrigem, modalidadeDestino, nomeDaTurmaDestino } = req.body;

  if (!alunosNomes || !alunosModalidadesOrigem || !alunosTurmasOrigem || !modalidadeDestino || !nomeDaTurmaDestino) {
    const {
      alunosNomes,
      alunosModalidadesOrigem,
      alunosTurmasOrigem,
      modalidadeDestino,
      nomeDaTurmaDestino
    } = req.body;
    console.log("Recebido na API:", req.body);
    console.log(alunosNomes, alunosModalidadesOrigem, alunosTurmasOrigem, modalidadeDestino, nomeDaTurmaDestino);
  }

  try {
    const alunosRemovidos: Aluno[] = [];
    for (let i = 0; i < alunosNomes.length; i++) {
      const alunoRemovido = await encontrarEremoverAluno(alunosModalidadesOrigem[i], alunosTurmasOrigem[i], alunosNomes[i]);
      if (alunoRemovido) {
        alunosRemovidos.push(alunoRemovido);
      }
    }

    if (alunosRemovidos.length > 0) {
      await atualizarTurma(modalidadeDestino, nomeDaTurmaDestino, alunosRemovidos, alunosRemovidos.length);
      return res.status(200).json({ message: 'Alunos movidos com sucesso.' });
    } else {
      return res.status(404).json({ error: 'Nenhum dos alunos especificados foi encontrado nas turmas de origem' });
    }
  } catch (error) {
    console.error('Erro ao mover alunos', error);
    return res.status(500).json({ error: 'Erro ao mover alunos' });
  }
}
