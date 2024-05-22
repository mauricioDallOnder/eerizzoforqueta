import * as admin from 'firebase-admin';
import axios from 'axios';

const serviceAccountUrl = 'https://storage.googleapis.com/bancodedadosceab.appspot.com/serviceKey.json';

async function initializeFirebaseAdmin() {
  try {
    const response = await axios.get(serviceAccountUrl);
    const serviceAccount = response.data;

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: 'https://bcoescolinha-default-rtdb.firebaseio.com/', // Substitua pela sua URL do banco de dados
      });
    }
    
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
  }
}

initializeFirebaseAdmin();

export default admin;
