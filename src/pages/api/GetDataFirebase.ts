// pages/api/getModalidades.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import admin from '../../config/firebaseAdmin';

export default async function getModalidades(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Caminho para as modalidades no Firebase
      const modalidadesRef = admin.database().ref('modalidades');
      
      // Pegar as modalidades do Firebase
      const snapshot = await modalidadesRef.once('value');
      const modalidades = snapshot.val();

      // Se não existirem modalidades, retornar uma lista vazia
      if (!modalidades) {
        return res.status(200).json([]);
      }

      // Retorna as modalidades
      res.status(200).json(modalidades);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar modalidades' });
    }
  } else {
    // Método não permitido
    res.setHeader('Allow', 'GET');
    res.status(405).end('Method Not Allowed');
  }
}
