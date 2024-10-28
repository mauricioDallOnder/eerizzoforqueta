import { NextApiRequest, NextApiResponse } from 'next';
import admin from '../../config/firebaseAdmin';

const db = admin.database();

async function removerAluno(modalidade: string, nomeDaTurma: string, identificadorUnico: string): Promise<void> {
    console.log('Iniciando a remoção do aluno...');
    console.log('Modalidade:', modalidade);
    console.log('Nome da Turma:', nomeDaTurma);
    console.log('Identificador Único:', identificadorUnico);

    const turmasRef = db.ref(`modalidades/${modalidade}/turmas`);
    const snapshot = await turmasRef.once('value');

    if (snapshot.exists()) {
        const turmasData = snapshot.val();
        console.log('Turmas encontradas:', Object.keys(turmasData));

        // Encontrar a turma com o nome correspondente
        const turmaKey = Object.keys(turmasData).find(key => {
            const turma = turmasData[key];
            console.log(`Verificando turma: ${turma.nome_da_turma} (Key: ${key})`);
            return turma.nome_da_turma.trim().toLowerCase() === nomeDaTurma.trim().toLowerCase();
        });

        if (turmaKey) {
            const turma = turmasData[turmaKey];
            console.log('Turma encontrada:', turma.nome_da_turma);

            // Encontrar o aluno com o IdentificadorUnico correspondente
            const alunos = turma.alunos || {};
            console.log('Alunos na turma:', Object.keys(alunos));

            const alunoKey = Object.keys(alunos).find(key => {
                const aluno = alunos[key];
                const alunoIdentificador = aluno.informacoesAdicionais?.IdentificadorUnico;
                console.log(`Verificando aluno: ${aluno.nome} (ID: ${alunoIdentificador})`);
                return alunoIdentificador === identificadorUnico;
            });

            if (alunoKey) {
                // Remover o aluno
                await db.ref(`modalidades/${modalidade}/turmas/${turmaKey}/alunos/${alunoKey}`).remove();

                // Atualizar o contador de alunos se necessário
                if (turma.capacidade_atual_da_turma && turma.capacidade_atual_da_turma > 0) {
                    const novoContadorAlunos = turma.capacidade_atual_da_turma - 1;
                    await db.ref(`modalidades/${modalidade}/turmas/${turmaKey}`).update({ capacidade_atual_da_turma: novoContadorAlunos });
                }

                console.log('Aluno removido com sucesso.');
            } else {
                console.error('Aluno não encontrado na turma especificada.');
                throw new Error('Aluno não encontrado');
            }
        } else {
            console.error('Turma não encontrada na modalidade especificada.');
            throw new Error('Turma não encontrada');
        }
    } else {
        console.error('Modalidade não encontrada no banco de dados.');
        throw new Error('Turmas não encontradas');
    }
}

export default async function deleteStudent(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    const { alunoId, modalidade, nomeDaTurma } = req.body;

    if (!alunoId || !modalidade || !nomeDaTurma) {
        return res.status(400).json({ error: 'Dados incompletos para excluir o aluno.' });
    }

    try {
        await removerAluno(modalidade, nomeDaTurma, alunoId);
        return res.status(200).json({ message: 'Aluno removido com sucesso.' });
    } catch (error: any) {
        console.error('Erro ao remover aluno', error);
        return res.status(500).json({ error: error.message || 'Erro ao remover aluno' });
    }
}
