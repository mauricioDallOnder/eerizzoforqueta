import type { NextApiRequest, NextApiResponse } from 'next';
import admin from '@/config/firebaseAdmin';

const db = admin.database();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const modalidadesRef = db.ref('modalidades');
      const modalidadesSnapshot = await modalidadesRef.once('value');
      const modalidades = modalidadesSnapshot.val();
      res.status(200).json(modalidades);
    } catch (error) {
      console.error('Erro ao obter modalidades:', error);
      res.status(500).json({ error: 'Erro ao obter modalidades.' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
