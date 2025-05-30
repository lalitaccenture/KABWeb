"use client";

import "./globals.css";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
import Header from "@/src/components/Header";
import Footer from "@/src/components/Footer"; 
import Head from "next/head";
import { SessionProvider } from "next-auth/react";
import { usePathname } from "next/navigation";
import AutoLogout from "@/src/components/AutoLogout";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  const hiddenPaths = ["/", "/signup"];

  const shouldHideHeaderFooter = hiddenPaths.includes(pathname);
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
        <AutoLogout/>
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
       {!shouldHideHeaderFooter && <Header />}
        <main className="flex-grow">{children}</main>
    {/*     {!shouldHideHeaderFooter && <Footer />} */}
        </SessionProvider>
      </body>
    </html>
  );
}
