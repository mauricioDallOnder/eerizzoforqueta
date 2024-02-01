// pages/api/moveStudent.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import admin from '../../config/firebaseAdmin';
import { Aluno, Turma } from '@/interface/interfaces';

// Função auxiliar para atualizar capacidade da turma e contador de alunos
async function atualizarTurma(modalidade: string, nomeTurma: string, aluno: any, incremento: number) {
  const turmaRef = admin.database().ref(`modalidades/${modalidade}/turmas`).orderByChild('nome_da_turma').equalTo(nomeTurma);
  const snapshot = await turmaRef.once('value');
  if (snapshot.exists()) {
    const turmaData = snapshot.val();
    const turmaKey = Object.keys(turmaData)[0];
    const turma = turmaData[turmaKey];

    // Se o aluno está sendo adicionado, atualize o contador e adicione o aluno
    if (incremento > 0) {
      const novoIdAluno = turma.contadorAlunos ? turma.contadorAlunos + 1 : 1;
      aluno.id = novoIdAluno;
      if (!turma.alunos) {
        turma.alunos = {};
      }
      turma.alunos[novoIdAluno] = aluno;
    }

    // Atualize a turma com a nova capacidade e, se necessário, com os alunos atualizados
    await admin.database().ref(`modalidades/${modalidade}/turmas/${turmaKey}`).update({
      alunos: turma.alunos,
      contadorAlunos: turma.contadorAlunos ? turma.contadorAlunos + incremento : 1,
      capacidade_atual_da_turma: turma.capacidade_atual_da_turma + incremento
    });
  }
}

export default async function moveStudent(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const {
        alunoNome,
        modalidadeOrigem,
        nomeDaTurmaOrigem,
        modalidadeDestino,
        nomeDaTurmaDestino,
      } = req.body;

      // Encontrar o aluno na turma de origem e obtém os dados do aluno
      const alunoDados = await encontrarEremoverAluno(modalidadeOrigem, nomeDaTurmaOrigem, alunoNome);

      // Se o aluno foi encontrado e removido, adicione à nova turma e atualize o contador
      if (alunoDados) {
        await atualizarTurma(modalidadeDestino, nomeDaTurmaDestino, alunoDados, 1);
        await atualizarTurma(modalidadeOrigem, nomeDaTurmaOrigem, null, -1);
        return res.status(200).json({ message: 'Aluno movido com sucesso' });
      } else {
        return res.status(404).json({ error: 'Aluno não encontrado na turma de origem' });
      }
    } catch (error) {
      console.error('Erro ao mover aluno', error);
      return res.status(500).json({ error: 'Erro ao mover aluno' });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}

// Função auxiliar para encontrar e remover aluno da turma de origem
async function encontrarEremoverAluno(modalidade: string, nomeDaTurma: string, alunoNome: string) {
  const turmaRef = admin.database().ref(`modalidades/${modalidade}/turmas`).orderByChild('nome_da_turma').equalTo(nomeDaTurma);
  const snapshot = await turmaRef.once('value');
  if (snapshot.exists()) {
    const turmaData = snapshot.val();
    const turmaKey = Object.keys(turmaData)[0];
    const turma = turmaData[turmaKey];

    let alunoIdToRemove;
    let alunoToRemove;
    for (const [id, alunoObject] of Object.entries(turma.alunos || {})) {
      // Aqui usamos um type assertion para dizer ao TypeScript que `alunoObject` é do tipo `Aluno`
      const aluno = alunoObject as Aluno;
      if (aluno && aluno.nome === alunoNome) {
        alunoIdToRemove = id;
        alunoToRemove = aluno;
        break;
      }
    }
    

    if (alunoIdToRemove) {
      delete turma.alunos[alunoIdToRemove];
      await admin.database().ref(`modalidades/${modalidade}/turmas/${turmaKey}/alunos`).set(turma.alunos);
      return alunoToRemove;
    }
  }
  return null; // Aluno não encontrado
}
