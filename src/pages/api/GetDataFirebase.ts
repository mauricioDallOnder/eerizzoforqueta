import type { NextApiRequest, NextApiResponse } from 'next';
import admin from '../../config/firebaseAdmin';

export default async function getModalidades(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const modalidade = req.query.modalidade as string | undefined;

    try {
      let query = admin.database().ref('modalidades');

      // Corrigido: Filtrar por modalidade específica, se fornecida
      if (modalidade) {
        // Acessa diretamente o nó da modalidade se o nome for fornecido
        query = query.child(modalidade);
      }

      const snapshot = await query.once('value');
      const modalidades = snapshot.val();

      if (!modalidades) {
        return res.status(200).json([]);
      }

      // Retorna as modalidades ou a modalidade específica
      res.status(200).json(modalidades);
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
