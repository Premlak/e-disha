"use client"
import NavBar from '../../_components/NabBar';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const response = await fetch('/api/admin/verify', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          router.replace('/admin');
        }
      } catch (error) {
        router.replace('/admin');
      } finally {
      }
    };
    verifyAuth();
  }, [router]);
  return (
    <div className="flex">
      <div className="w-1/5 fixed left-0 top-0 h-screen">
        <NavBar />
      </div>
      <div className="w-4/5 ml-[20%]">
        <main className="h-screen overflow-y-auto">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
