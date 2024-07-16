import * as admin from 'firebase-admin';
// database teste: https://teste-1fba5-default-rtdb.firebaseio.com/
//database oficial: https://escola15072024-default-rtdb.firebaseio.com/
if (!admin.apps.length) {
  const serviceAccount = require('./serviceKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount), // Substitua serviceAccount pelo seu arquivo de credenciais
    databaseURL: 'https://bcooficial-dd90c-default-rtdb.europe-west1.firebasedatabase.app', // Substitua pela sua URL do banco de dados
  });
}

export default admin;
