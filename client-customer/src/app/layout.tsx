import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import Logo from './components/Logo';

export const metadata: Metadata = {
  title: 'Đăng Ký Văn Phòng',
  description: 'Hệ thống đăng ký lên văn phòng',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps): React.ReactElement {
  return (
    <html lang="vi">
      <body>
        <header>
          <div className="container">
            <div style={{ padding: '0', margin: '0' }}>
              <Logo />
            </div>
          </div>
        </header>
        <main className="container">
          {children}
        </main>
      </body>
    </html>
  );
}
