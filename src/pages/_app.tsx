import Layout from "@/components/TopBarComponents/Layout";
import { DataProvider } from "@/context/context";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { SessionProvider } from 'next-auth/react'
export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
    <DataProvider>
     
        <Component {...pageProps} />
      
    </DataProvider>
    </SessionProvider>
  );
}
