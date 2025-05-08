"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home(): React.ReactElement {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/register');
  }, [router]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <p>Đang chuyển hướng...</p>
    </div>
  );
}
