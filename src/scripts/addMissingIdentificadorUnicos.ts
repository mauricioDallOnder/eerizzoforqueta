// scripts/addMissingIdentificadorUnicos.ts

import admin from '../config/firebaseAdmin';
import { v4 as uuidv4 } from 'uuid';

async function addMissingIdentificadorUnicos() {
    const db = admin.database();
    const modalidadesRef = db.ref('modalidades');
    const snapshot = await modalidadesRef.once('value');
    const modalidades = snapshot.val();

    for (const modalidadeKey in modalidades) {
        const modalidade = modalidades[modalidadeKey];
        if (modalidade.turmas) {
            for (const turmaKey in modalidade.turmas) {
                const turma = modalidade.turmas[turmaKey];
                if (turma.alunos) {
                    for (const alunoKey in turma.alunos) {
                        const aluno = turma.alunos[alunoKey];
                        if (!aluno.informacoesAdicionais) {
                            aluno.informacoesAdicionais = {};
                        }
                        if (!aluno.informacoesAdicionais.IdentificadorUnico) {
                            const identificadorUnico = uuidv4();
                            aluno.informacoesAdicionais.IdentificadorUnico = identificadorUnico;
                            // Atualiza o aluno no banco de dados
                            await db.ref(`modalidades/${modalidadeKey}/turmas/${turmaKey}/alunos/${alunoKey}/informacoesAdicionais`).update({
                                IdentificadorUnico: identificadorUnico,
                            });
                            console.log(`IdentificadorUnico atribuído ao aluno ${aluno.nome} (Key: ${alunoKey})`);
                        }
                    }
                }
            }
        }
    }
    console.log('Processo concluído: IdentificadorUnico atribuído a todos os alunos sem identificador.');
}

// Executa a função
addMissingIdentificadorUnicos().catch(error => {
    console.error('Erro ao atribuir IdentificadorUnico aos alunos:', error);
});
