import type { NextApiRequest, NextApiResponse } from 'next';
import corrigirDadosTurmaFirebase from '@/utils/AjustarDadosFirebase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { modalidadeNome, turmaNome } = req.body;
    if (!modalidadeNome || !turmaNome) {
      return res.status(400).json({ error: 'Modalidade e nome da turma são obrigatórios.' });
    }

    try {
      const { corrigidos, duplicados } = await corrigirDadosTurmaFirebase(modalidadeNome, turmaNome);
      res.status(200).json({ corrigidos, duplicados });
    } catch (error) {
      console.error('Erro ao corrigir dados da turma:', error);
      res.status(500).json({ error: 'Erro ao corrigir dados da turma.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
