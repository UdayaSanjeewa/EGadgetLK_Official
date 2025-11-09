'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthManager } from '@/lib/auth';
import { Sidebar } from '@/components/admin/Sidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState('Admin');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const checkAdmin = async () => {
      const user = await AuthManager.getUser();
      const admin = await AuthManager.isAdmin();

      if (!admin && pathname !== '/admin/login') {
        router.push('/admin/login');
      } else {
        setIsAdmin(true);
        if (user) {
          setUserName(user.name);
          setUserEmail(user.email);
        }
      }
      setIsLoading(false);
    };
    checkAdmin();
  }, [router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAdmin && pathname !== '/admin/login') {
    return null;
  }

  if (pathname === '/admin/login') {
    return children;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64">
        <AdminHeader userName={userName} userEmail={userEmail} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
