const admin = require('firebase-admin');

// Inicialize o Firebase Admin
const serviceAccount = require('./serviceKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://backend-18374-default-rtdb.firebaseio.com/',
});

const db = admin.database();

async function migrateData() {
  const modalidadesRef = db.ref('modalidades');
  const modalidadesSnapshot = await modalidadesRef.once('value');
  const modalidades = modalidadesSnapshot.val();

  for (const modalidadeNome in modalidades) {
    const turmas = modalidades[modalidadeNome].turmas;
    if (turmas) {
      for (let i = 0; i < turmas.length; i++) {
        let contadorAlunos = -1;
        const turma = turmas[i];

        if (Array.isArray(turma.alunos)) {
          for (const aluno of turma.alunos) {
            contadorAlunos++;
            aluno.id = contadorAlunos; // Atribui um ID numérico
          }
        }

        // Atualiza a turma com o novo contador
        turma.contadorAlunos = contadorAlunos;
        modalidadesRef.child(`${modalidadeNome}/turmas/${i}`).set(turma);
      }
    }
  }
}

migrateData().then(() => {
  console.log('Migração concluída com sucesso.');
}).catch((error) => {
  console.error('Erro durante a migração:', error);
});
