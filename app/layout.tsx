'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { Toaster } from 'sonner';
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isSellerRoute = pathname?.startsWith('/seller');
  const isAdminRoute = pathname?.startsWith('/admin');
  const hideHeaderFooter = isSellerRoute || isAdminRoute;

  return (
    <html lang="en">
      <head>
        <title>SIBN Ecommerce - Sri Lanka&apos;s Largest Online Marketplace</title>
        <meta name="description" content="Buy and sell everything from cars to electronics, property to fashion. Join millions of users on Sri Lanka's most trusted marketplace." />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#1e40af" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            {!hideHeaderFooter && <Header />}
            <main className="flex-1">
              {children}
            </main>
            {!hideHeaderFooter && <Footer />}
            <Toaster position="top-right" />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}