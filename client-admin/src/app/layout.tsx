'use client';

import React from 'react';
import './globals.css';
import Logo from './components/Logo';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Metadata được chuyển vào file metadata.ts riêng biệt

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps): React.ReactElement {
  const pathname = usePathname();
  const [showDropdown, setShowDropdown] = React.useState(false);
  
  // Kiểm tra xem người dùng đã đăng nhập chưa (dựa vào cookie)
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  
  React.useEffect(() => {
    // Kiểm tra cookie trong useEffect để tránh lỗi hydration
    const checkLoginStatus = () => {
      setIsLoggedIn(document.cookie.includes('isLoggedIn=true'));
    };
    
    // Kiểm tra ban đầu
    checkLoginStatus();
    
    // Thêm event listener để kiểm tra khi có thay đổi cookie
    window.addEventListener('storage', checkLoginStatus);
    
    // Thêm event listener cho sự kiện tùy chỉnh khi đăng nhập
    window.addEventListener('login-success', checkLoginStatus);
    
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
      window.removeEventListener('login-success', checkLoginStatus);
    };
  }, []);
  return (
    <html lang="vi">
      <head>
        <title>Quản Lý Đăng Ký Văn Phòng</title>
      </head>
      <body>
        <header style={{ backgroundColor: '#1e2e3e', color: 'white', padding: '0', width: '100%', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)', height: '80px', display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Logo />
              
              <div style={{ marginLeft: '100px' }}>
                <nav>
                  <ul style={{ display: 'flex', gap: '20px', listStyle: 'none', margin: '0', padding: '0' }}>
                    <li>
                      <Link 
                        href="/" 
                        style={{ 
                          color: pathname === '/' ? '#ffffff' : '#cccccc', 
                          textDecoration: 'none', 
                          padding: '10px 15px', 
                          fontSize: '0.95rem',
                          transition: 'all 0.3s ease',
                          fontWeight: pathname === '/' ? '600' : '400',
                        }}
                        onMouseOver={(e) => {
                          if (pathname !== '/') {
                            e.currentTarget.style.color = '#ffffff';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }
                        }}
                        onMouseOut={(e) => {
                          if (pathname !== '/') {
                            e.currentTarget.style.color = '#cccccc';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }
                        }}
                      >
                        Trang chủ
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href="/admin" 
                        style={{ 
                          color: pathname === '/admin' ? '#ffffff' : '#cccccc', 
                          textDecoration: 'none', 
                          padding: '10px 15px', 
                          fontSize: '0.95rem',
                          transition: 'all 0.3s ease',
                          fontWeight: pathname === '/admin' ? '600' : '400',
                        }}
                        onMouseOver={(e) => {
                          if (pathname !== '/admin') {
                            e.currentTarget.style.color = '#ffffff';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }
                        }}
                        onMouseOut={(e) => {
                          if (pathname !== '/admin') {
                            e.currentTarget.style.color = '#cccccc';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }
                        }}
                      >
                        Quản lý đăng ký
                      </Link>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
            
            <div style={{ marginRight: '10px', position: 'relative' }}>
              {isLoggedIn ? (
                <>
                  <div 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      cursor: 'pointer',
                      padding: '5px'
                    }}
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '50%', 
                      backgroundColor: '#e0e0e0', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      marginRight: '10px',
                      overflow: 'hidden'
                    }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>
                    <div style={{ color: 'white' }}>
                      <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>Admin</div>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '5px' }}>
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                  
                  {showDropdown && (
                    <div style={{ 
                      position: 'absolute', 
                      top: '50px', 
                      right: '0', 
                      backgroundColor: 'white', 
                      borderRadius: '4px', 
                      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)', 
                      width: '200px',
                      zIndex: 10
                    }}>
                      <div style={{ padding: '15px', borderBottom: '1px solid #eee' }}>
                        <div style={{ fontWeight: '600', color: '#333' }}>Admin</div>
                        <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>Tài khoản quản trị viên</div>
                      </div>
                      
                      <Link 
                        href="/login" 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          padding: '12px 15px', 
                          color: '#333', 
                          textDecoration: 'none',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = '#f5f5f5';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                        onClick={(e) => {
                          e.preventDefault(); // Ngăn chặn hành vi mặc định của Link
                          
                          // Xóa cookie đăng nhập
                          document.cookie = 'isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                          localStorage.removeItem('adminLoggedIn');
                          
                          // Cập nhật trạng thái đăng nhập
                          setIsLoggedIn(false);
                          setShowDropdown(false);
                          
                          // Chuyển hướng về trang đăng nhập mới
                          window.location.href = '/login-new';
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px' }}>
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                          <polyline points="16 17 21 12 16 7"></polyline>
                          <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        Đăng xuất
                      </Link>
                    </div>
                  )}
                </>
              ) : (
                <Link 
                  href="/login-new" 
                  style={{ 
                    padding: '10px 15px', 
                    cursor: 'pointer', 
                    fontWeight: '600', 
                    color: '#cccccc', 
                    textDecoration: 'none', 
                    transition: 'all 0.3s ease',
                    fontSize: '0.95rem',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.color = '#cccccc';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  Đăng nhập
                </Link>
              )}
            </div>
          </div>
        </header>
        
        <main style={{ width: '100%', margin: '20px auto 0', padding: '0 15px' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
