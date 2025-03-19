"use client";

import "./globals.css";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
import Header from "@/src/components/Header";
import Footer from "@/src/components/Footer"; 
import Head from "next/head";
import { SessionProvider } from "next-auth/react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
       <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Neris:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body className="flex flex-col min-h-screen">
      <SessionProvider>
        <ToastContainer
          position="top-right" 
          autoClose={5000}     
          hideProgressBar={false}  
          newestOnTop={false}  
          closeOnClick         
          rtl={false}         
          pauseOnFocusLoss     
          draggable           
          pauseOnHover         
        />
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
