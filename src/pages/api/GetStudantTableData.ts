import type { NextApiRequest, NextApiResponse } from 'next';
import admin from '../../config/firebaseAdmin';
import { Turma, Modalidade } from '@/interface/interfaces'; // Importar os tipos adequados

export default async function getStudantTableData(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const modalidade = req.query.modalidade as string | undefined;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const offset = parseInt(req.query.offset as string, 10) || 0;

    try {
      let query = admin.database().ref('modalidades');

      // Filtrar por modalidade específica, se fornecida
      if (modalidade) {
        query = query.child(modalidade);
      }

      const snapshot = await query.once('value');
      const modalidades = snapshot.val();

      if (!modalidades) {
        return res.status(200).json([]);
      }

      // Adiciona o cabeçalho Cache-Control para desativar o cache
      res.setHeader('Cache-Control', 'no-cache');

      // Simula a paginação (limit e offset)
      const modalidadesArray: Modalidade[] = Object.entries(modalidades).map(([nome, valor]) => ({
        nome,
        turmas: (valor as any).turmas as Turma[], // Definindo explicitamente o tipo de valor como Turma[]
      }));

      const paginatedData = modalidadesArray.slice(offset, offset + limit);

      // Retorna as modalidades ou a modalidade específica
      res.status(200).json(paginatedData);
    } catch (error) {
      console.error('Erro ao buscar modalidades:', error);
      res.status(500).json({ error: 'Erro ao buscar modalidades' });
    }
  } else {
    res.setHeader('Allow', 'GET');
    res.status(405).end('Method Not Allowed');
  }
}
export const config = {
  api: {
    responseLimit: false,
  },
};
