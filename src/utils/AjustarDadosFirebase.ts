import admin from '../config/firebaseAdmin';
import { Aluno } from '@/interface/interfaces'; // Ajuste os caminhos conforme necessário

const db = admin.database();

interface FirebaseTurma {
  alunos: { [key: string]: Aluno };
}

async function corrigirDadosTurmaFirebase(): Promise<{ corrigidos: string[], duplicados: string[] }> {
  let corrigidos: string[] = [];
  let duplicados: string[] = [];

  const modalidadesRef = db.ref('modalidades');
  const modalidadesSnapshot = await modalidadesRef.once('value');
  const modalidades = modalidadesSnapshot.val();

  for (const modalidadeNome in modalidades) {
    const modalidade = modalidades[modalidadeNome];
    for (const turmaNome in modalidade.turmas) {
      const turma = modalidade.turmas[turmaNome];

      if (!turma.alunos) continue;

      const alunosObj: { [key: string]: Aluno } = turma.alunos;
      const alunosArray: Aluno[] = Object.values(alunosObj);
      const nomesUnicos = new Set<string>();
      const alunosSemDuplicatas: Aluno[] = [];

      // Remoção de duplicatas baseado no nome
      alunosArray.forEach(aluno => {
        const nomeNormalizado = aluno.nome?.toLowerCase();
        if (nomeNormalizado && !nomesUnicos.has(nomeNormalizado)) {
          nomesUnicos.add(nomeNormalizado);
          alunosSemDuplicatas.push(aluno);
        } else if (nomeNormalizado) {
          duplicados.push(`${aluno.nome} na turma ${turmaNome} da modalidade ${modalidadeNome}`);
        }
      });

      // Ordenação e correção de IDs
      const alunosCorrigidos: { [key: string]: Aluno } = {};
      alunosSemDuplicatas.sort((a, b) => a.id - b.id).forEach((aluno, index) => {
        if (aluno.id !== index) {
          corrigidos.push(`Índice corrigido: ${aluno.nome} (Antigo ID: ${aluno.id}, Novo ID: ${index}) na turma ${turmaNome} da modalidade ${modalidadeNome}`);
          aluno.id = index;
        }
        alunosCorrigidos[`${index}`] = { ...aluno, id: index }; // Reatribuir IDs como números
      });

      // Atualização no Firebase
      await db.ref(`modalidades/${modalidadeNome}/turmas/${turmaNome}/alunos`).set(alunosCorrigidos);
      await db.ref(`modalidades/${modalidadeNome}/turmas/${turmaNome}`).update({
        contadorAlunos: alunosSemDuplicatas.length,
        capacidade_atual_da_turma: alunosSemDuplicatas.length,
      });

      console.log(`Dados corrigidos para a turma ${turmaNome} da modalidade ${modalidadeNome}.`);
    }
  }

  console.log('Correção de dados da turma concluída.');
  return { corrigidos, duplicados };
}

export default corrigirDadosTurmaFirebase;
