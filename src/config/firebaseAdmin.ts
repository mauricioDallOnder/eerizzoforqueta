import * as admin from 'firebase-admin';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente do arquivo .env se estiver em ambiente de desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// Define a interface para o tipo de dados do service account conforme esperado por Firebase
interface ServiceAccount {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

// Função para converter o JSON decodificado para o formato esperado
function parseServiceAccount(jsonString: string): ServiceAccount {
  const parsed = JSON.parse(jsonString);
  return {
    projectId: parsed.project_id,
    clientEmail: parsed.client_email,
    privateKey: parsed.private_key,
  };
}

if (!admin.apps.length) {
  // Decodifica a string Base64 e converte para JSON
  const serviceAccountString = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string, 'base64').toString('utf-8');
  const serviceAccount: ServiceAccount = parseServiceAccount(serviceAccountString);
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

export default admin;
