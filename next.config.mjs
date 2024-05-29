/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['firebasestorage.googleapis.com','oaidalleapiprodscus.blob.core.windows.net','drive.google.com'],
   
  },
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Aumente o limite de tamanho conforme necessário
    },
  },
};

export default nextConfig;
