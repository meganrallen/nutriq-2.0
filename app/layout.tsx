'use client';

import './globals.css';
import Navigation from './components/Navigation';
import BottomNav from './components/BottomNav';
import { useEffect } from 'react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Fix for mobile viewport height
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVH();
    window.addEventListener('resize', setVH);
    return () => window.removeEventListener('resize', setVH);
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className="min-h-[100vh] min-h-[calc(var(--vh,1vh)*100)] bg-gray-50">
        <Navigation />
        <main className="pt-20 pb-20 px-4">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
} 