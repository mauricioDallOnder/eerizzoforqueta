import * as admin from 'firebase-admin';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente do arquivo .env se estiver em ambiente de desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// Define a interface para o tipo de dados do service account
interface ServiceAccount {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

if (!admin.apps.length) {
  // Converte a string JSON armazenada na variável de ambiente em um objeto
  const serviceAccount: ServiceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

export default admin;
