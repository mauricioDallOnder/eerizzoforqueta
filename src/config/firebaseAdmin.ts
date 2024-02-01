import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  const serviceAccount = require('./serviceKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount), // Substitua serviceAccount pelo seu arquivo de credenciais
    databaseURL: 'https://backend-18374-default-rtdb.firebaseio.com', // Substitua pela sua URL do banco de dados
  });
}

export default admin;