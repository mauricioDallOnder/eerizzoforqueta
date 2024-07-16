import * as admin from 'firebase-admin';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente do arquivo .env se estiver em ambiente de desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// Define a interface para o tipo de dados do service account
interface ServiceAccount {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
  universe_domain: string;
}

if (!admin.apps.length) {
  // Decodifica a string Base64 e converte para JSON
  const serviceAccountString = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string, 'base64').toString('utf-8');
  const serviceAccount: ServiceAccount = JSON.parse(serviceAccountString);
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

export default admin;
