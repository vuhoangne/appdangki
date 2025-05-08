"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from './components/Logo';

interface AdminHomeProps {}

export default function AdminHome({}: AdminHomeProps): React.ReactElement {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Kiểm tra đăng nhập từ localStorage
  useEffect(() => {
    const loggedIn = localStorage.getItem('adminLoggedIn');
    if (loggedIn === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    
    // Thông tin đăng nhập đơn giản (trong thực tế nên sử dụng API)
    if (username === 'admin' && password === 'admin123321') {
      localStorage.setItem('adminLoggedIn', 'true');
      setIsLoggedIn(true);
      setError('');
    } else {
      setError('Tên đăng nhập hoặc mật khẩu không đúng');
    }
  };

  const handleLogout = (): void => {
    // Xóa cookie đăng nhập
    document.cookie = 'isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    localStorage.removeItem('adminLoggedIn');
    
    // Chuyển hướng về trang đăng nhập mới
    window.location.href = '/login-new';
  };

  const router = useRouter();
  
  // Chuyển hướng đến trang login nếu chưa đăng nhập
  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, router]);
  
  if (!isLoggedIn) {
    // Trả về fragment rỗng thay vì null để tránh lỗi TypeScript
    return <></>; // Trang sẽ chuyển hướng đến trang login
  }

  return (
    <div style={{ padding: '20px', width: '95%', maxWidth: '1600px', margin: '0 auto', boxSizing: 'border-box' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#1e2e3e' }}>Trang Chủ Quản Trị</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {/* Thẻ quản lý đăng ký */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)', overflow: 'hidden' }}>
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ backgroundColor: '#1e2e3e', borderRadius: '50%', width: '50px', height: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: '15px' }}>
                <svg style={{ width: '24px', height: '24px', color: 'white' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e2e3e', marginBottom: '5px' }}>Quản lý đăng ký văn phòng</h3>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>Xem và quản lý danh sách đăng ký</p>
                <Link href="/admin" style={{ display: 'inline-block', padding: '8px 16px', backgroundColor: '#1e2e3e', color: 'white', borderRadius: '4px', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
                  Xem danh sách
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Thẻ thống kê */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)', overflow: 'hidden' }}>
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ backgroundColor: '#1e2e3e', borderRadius: '50%', width: '50px', height: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: '15px' }}>
                <svg style={{ width: '24px', height: '24px', color: 'white' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e2e3e', marginBottom: '5px' }}>Thống kê đăng ký</h3>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>Xem báo cáo và thống kê</p>
                <button 
                  onClick={() => alert('Tính năng đang phát triển')} 
                  style={{ display: 'inline-block', padding: '8px 16px', backgroundColor: '#1e2e3e', color: 'white', border: 'none', borderRadius: '4px', textDecoration: 'none', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}
                >
                  Xem thống kê
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Thẻ cài đặt */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)', overflow: 'hidden' }}>
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ backgroundColor: '#1e2e3e', borderRadius: '50%', width: '50px', height: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: '15px' }}>
                <svg style={{ width: '24px', height: '24px', color: 'white' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e2e3e', marginBottom: '5px' }}>Cài đặt hệ thống</h3>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>Quản lý cài đặt và tài khoản</p>
                <button 
                  onClick={handleLogout} 
                  style={{ display: 'inline-block', padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', textDecoration: 'none', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
