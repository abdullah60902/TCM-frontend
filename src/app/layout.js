// app/layout.js ya app/layout.tsx

'use client';

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "./(component)/footer/Footer";
import NextTopLoader from "nextjs-toploader";
import { AuthProvider } from '../app/context/AuthContext';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import '../mockBackend'; // <--- Added mockBackend interceptor

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});



export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NextTopLoader
          color="#1f1fef"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
        />
        <AuthProvider>{children}</AuthProvider>
        <Footer />
              <ToastContainer position="top-right" autoClose={3000} />

      </body>
    </html>
  );
}
