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
        <title>E-GadgetLK - Sri Lanka&apos;s Premier Electronics & Gadgets Store</title>
        <meta name="description" content="Shop the latest smartphones, laptops, tablets, and electronics at E-GadgetLK. Sri Lanka's most trusted tech marketplace with the best prices." />
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
            <Toaster position="bottom-right" />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}