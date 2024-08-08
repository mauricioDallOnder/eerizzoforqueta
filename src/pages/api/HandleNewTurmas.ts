import type { NextApiRequest, NextApiResponse } from 'next';
import admin from '../../config/firebaseAdmin';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const db = admin.database();

// Esquema de validação usando Zod
const turmaSchema = z.object({
  modalidade: z.string().min(1),
  nucleo: z.string().min(1),
  categoria: z.string().min(1),
  capacidade_maxima_da_turma: z.number().min(1),
  diaDaSemana: z.string().min(1),
  horario: z.string().min(1)
});

// Handler da API
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'POST':
      return handlePost(req, res);
    case 'PUT':
      return handlePut(req, res);
    case 'DELETE':
      return handleDelete(req, res);
    default:
      res.setHeader('Allow', ['POST', 'PUT', 'DELETE']);
      return res.status(405).end('Method Not Allowed');
  }
}

// Função para lidar com o método POST
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Validando o corpo da requisição
    const newTurmaData = turmaSchema.parse(req.body);
    const { modalidade, nucleo, categoria, capacidade_maxima_da_turma, diaDaSemana, horario } = newTurmaData;

    const nome_da_turma = `${categoria}_${nucleo}_${diaDaSemana}_${horario}`;
    const uuidTurma = uuidv4();

    // Obtenha a referência da modalidade
    const modalidadeRef = db.ref(`modalidades/${modalidade}/turmas`);
    const modalidadeSnapshot = await modalidadeRef.once('value');

    // Crie o novo ID da turma baseado na quantidade existente
    const newTurmaId = modalidadeSnapshot.exists() ? modalidadeSnapshot.numChildren() : 0;

    const novaTurma = {
      nome_da_turma,
      modalidade,
      nucleo,
      categoria,
      capacidade_maxima_da_turma,
      capacidade_atual_da_turma: 0,
      alunos: [],
      uuidTurma,
      contadorAlunos: 0
    };

    // Adiciona a nova turma na próxima posição disponível
    await modalidadeRef.child(newTurmaId.toString()).set(novaTurma);

    return res.status(200).json({ message: 'Turma adicionada com sucesso', turma: novaTurma });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Dados inválidos', errors: error.errors });
    }
    return res.status(500).json({ message: 'Erro no servidor' });
  }
}

// Função para lidar com o método PUT (Atualização)
async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Validando o corpo da requisição
    const updateTurmaData = turmaSchema.partial().extend({
      uuidTurma: z.string().uuid(),
      nome_da_turma: z.string().min(1)
    }).parse(req.body);
    const { uuidTurma, modalidade, nome_da_turma, capacidade_maxima_da_turma, nucleo, categoria } = updateTurmaData;

    // Encontrando a turma a ser atualizada
    const turmaRef = db.ref(`modalidades/${modalidade}/turmas`).orderByChild('uuidTurma').equalTo(uuidTurma);
    const snapshot = await turmaRef.once('value');

    if (!snapshot.exists()) {
      return res.status(404).json({ message: 'Turma não encontrada' });
    }

    const turmaKey = Object.keys(snapshot.val())[0];
    await db.ref(`modalidades/${modalidade}/turmas/${turmaKey}`).update({ nome_da_turma, capacidade_maxima_da_turma, nucleo, categoria });

    return res.status(200).json({ message: 'Turma atualizada com sucesso' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Dados inválidos', errors: error.errors });
    }
    return res.status(500).json({ message: 'Erro no servidor' });
  }
}



// Função para lidar com o método DELETE (Exclusão)
async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Validando o corpo da requisição
    const deleteTurmaSchema = z.object({
      modalidade: z.string().min(1),
      uuidTurma: z.string().uuid()
    });
    const { modalidade, uuidTurma } = deleteTurmaSchema.parse(req.body);

    // Encontrando a turma a ser excluída
    const turmaRef = db.ref(`modalidades/${modalidade}/turmas`).orderByChild('uuidTurma').equalTo(uuidTurma);
    const snapshot = await turmaRef.once('value');

    if (!snapshot.exists()) {
      return res.status(404).json({ message: 'Turma não encontrada' });
    }

    const turmaKey = Object.keys(snapshot.val())[0];
    await db.ref(`modalidades/${modalidade}/turmas/${turmaKey}`).remove();

    return res.status(200).json({ message: 'Turma excluída com sucesso' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Dados inválidos', errors: error.errors });
    }
    return res.status(500).json({ message: 'Erro no servidor' });
  }
}
