// pages/api/updateAttendance.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import admin from '../../config/firebaseAdmin';
import { Turma } from '@/interface/interfaces';

export default async function updateAttendance(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    try {
      const { modalidade, nomeDaTurma, anoNascimento,telefoneComWhatsapp, informacoesAdicionais,nome,alunoId } = req.body;

     // Caminho para as turmas da modalidade
     const turmasRef = admin.database().ref(`modalidades/${modalidade}/turmas`);
     const snapshot = await turmasRef.once('value');
     const turmas: Turma[] = snapshot.val(); 
     // Encontrar a turma e o aluno pelo nome
     let turmaIndex = -1;
     let alunoIndex = -1;
     turmas.forEach((turma, idx) => {
      if (turma.nome_da_turma === nomeDaTurma && Array.isArray(turma.alunos)) {
        turmaIndex = idx;
        turma.alunos.forEach((aluno, index) => {
          if (aluno.nome === nome) {
            alunoIndex = index;
          }
        });
      }
    });    
      // Se não encontrar a turma ou o aluno, retorna erro
      if (turmaIndex === -1 || alunoIndex === -1) {
        return res.status(404).json({ error: 'Turma ou aluno não encontrado' });
      }
//`modalidades/${modalidade}/turmas/${turmaIndex}/alunos/${nome}` e 
      // Atualizar as presenças e as informações adicionais do aluno
      const alunoRef = admin.database().ref(`modalidades/${modalidade}/turmas/${turmaIndex}/alunos/${alunoId}`);
     
      await alunoRef.update({
        nome: nome,
        anoNascimento: anoNascimento,
        telefoneComWhatsapp: telefoneComWhatsapp,
        informacoesAdicionais: informacoesAdicionais,
      });

      return res.status(200).json({ message: 'Informações do aluno atualizadas com sucesso' });
    } catch (error) {
      console.error('Erro ao atualizar informações do aluno', error);
      return res.status(500).json({ error: error });
    }
  } else {
    res.setHeader('Allow', 'PUT');
    res.status(405).end('Method Not Allowed');
  }
}
