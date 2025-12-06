'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });
        if (response.ok) {
          router.push('/dashboard');
        } else {
          router.push('/login');
        }
      } catch (error) {
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-4">
      <div className="text-center text-white">
        <h1 className="text-5xl font-bold mb-4">MyMenu</h1>
        <p className="text-xl mb-8">Digital Menu Management System</p>
        <Button variant="outline" onClick={() => router.push('/login')} className="text-white border-white hover:bg-white hover:text-primary">
          Get Started
        </Button>
      </div>
    </div>
  );
}
