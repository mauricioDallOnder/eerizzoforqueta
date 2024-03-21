// pages/api/corrigirDadosTurma.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import corrigirDadosTurmaFirebase from '@/utils/AjustarDadosFirebase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { corrigidos, duplicados } = await corrigirDadosTurmaFirebase(); // Captura o retorno da função
      res.status(200).json({ corrigidos, duplicados }); // Envie esses dados na resposta
    } catch (error) {
      console.error('Erro ao corrigir dados da turma:', error);
      res.status(500).json({ error: 'Erro ao corrigir dados da turma.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
