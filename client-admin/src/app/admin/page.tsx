"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { io } from 'socket.io-client';

interface Visit {
  id: string;
  name: string;
  email: string;
  phone: string;
  school: string;
  date: string;
  time?: string;
  floor?: string;
  purpose: string;
  contact: string;
  note?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  timestamp?: string;
}

export default function AdminPage(): React.ReactElement {
  // Hàm xử lý sửa đăng ký
  const handleEdit = (id: string) => {
    console.log('Editing visit with ID:', id);
    alert('Đang phát triển chức năng sửa đăng ký với ID: ' + id);
  };
  
  // Hàm xử lý xóa đăng ký
  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa đăng ký này không?')) {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3000/api/visits/${id}`, {
          method: 'DELETE',
        });
        
        const result = await response.json();
        
        if (response.ok) {
          console.log('Deleted visit:', result);
          alert('Đã xóa đăng ký thành công!');
          // Sau khi xóa thành công, cập nhật lại danh sách
          fetchVisits();
        } else {
          console.error('Error deleting visit:', result.error);
          alert('Lỗi khi xóa đăng ký: ' + result.error);
        }
      } catch (error) {
        console.error('Error deleting visit:', error);
        alert('Lỗi khi xóa đăng ký. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    }
  };
  const router = useRouter();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [filter, setFilter] = useState<string>('all'); // all, pending, approved, rejected

  const fetchVisits = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/visits');
      const data = await response.json();
      console.log('Fetched data:', data); // Debug log
      
      // Đảm bảo hiển thị đúng dữ liệu
      const processedData = data.map((visit: any) => ({
        ...visit,
        // Đảm bảo các trường luôn có giá trị
        school: visit.school || 'Chưa có thông tin',
        floor: visit.floor || (visit.department ? visit.department.replace('Tầng ', '') : '4'),
        time: visit.time || '9:00',
        contact: visit.contact || 'Chưa có thông tin'
      }));
      
      console.log('Processed data:', processedData);
      setVisits(processedData);
      
      console.log('Processed data:', processedData);
      setError('');
    } catch (error) {
      console.error('Error fetching visits:', error);
      setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    // Kiểm tra đăng nhập
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    
    // Tải dữ liệu khi component mount
    fetchVisits();
    
    // Thiết lập kết nối Socket.IO với cấu hình CORS
    const socket = io('http://localhost:3000', {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      extraHeaders: {
        'Access-Control-Allow-Origin': 'http://localhost:3002'
      }
    });
    
    // Lắng nghe sự kiện đăng ký mới
    socket.on('new-registration', (newVisit) => {
      console.log('Nhận đăng ký mới:', newVisit);
      // Cập nhật danh sách đăng ký
      setVisits(prev => {
        const updated = [newVisit, ...prev];
        return updated;
      });
    });
    
    // Lắng nghe sự kiện cập nhật đăng ký
    socket.on('update-registration', (updatedVisit) => {
      console.log('Cập nhật đăng ký:', updatedVisit);
      // Cập nhật danh sách đăng ký
      setVisits(prev => {
        const updated = prev.map(visit => 
          visit.id === updatedVisit.id ? updatedVisit : visit
        );
        return updated;
      });
    });
    
    // Lắng nghe sự kiện xóa đăng ký
    socket.on('delete-registration', (deletedId) => {
      console.log('Xóa đăng ký:', deletedId);
      // Cập nhật danh sách đăng ký
      setVisits(prev => {
        const updated = prev.filter(visit => visit.id !== deletedId);
        return updated;
      });
    });
    
    // Dọn dẹp khi component unmount
    return () => {
      socket.disconnect();
    };
  }, [router]);

  const updateVisitStatus = async (id: string, status: 'pending' | 'approved' | 'rejected'): Promise<void> => {
    try {
      const response = await fetch(`http://localhost:3000/api/visits/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        // Cập nhật trạng thái trong danh sách
        setVisits(visits.map(visit => 
          visit.id === id ? { ...visit, status } : visit
        ));
      } else {
        setError('Không thể cập nhật trạng thái. Vui lòng thử lại.');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi. Vui lòng thử lại sau.');
      console.error(err);
    }
  };

  // Lọc danh sách theo trạng thái
  const filteredVisits = visits.filter(visit => {
    if (filter === 'all') return true;
    return visit.status === filter;
  });

  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };
  
  const formatTime = (timeString?: string): string => {
    if (!timeString) return '';
    return timeString;
  };

  return (
    <div style={{ padding: '10px', width: '95%', maxWidth: '1600px', margin: '0 auto', boxSizing: 'border-box' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#1e2e3e' }}>Danh Sách Đăng Ký Văn Phòng</h1>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
        <div>
          <button 
            style={{ 
              padding: '5px 10px', 
              backgroundColor: filter === 'all' ? '#1e2e3e' : 'white', 
              color: filter === 'all' ? 'white' : '#333', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              marginRight: '10px',
              cursor: 'pointer'
            }}
            onClick={() => setFilter('all')}
          >
            Tất cả
          </button>
          <button 
            style={{ 
              padding: '5px 10px', 
              backgroundColor: filter === 'pending' ? '#1e2e3e' : 'white', 
              color: filter === 'pending' ? 'white' : '#333', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              marginRight: '10px',
              cursor: 'pointer'
            }}
            onClick={() => setFilter('pending')}
          >
            Chờ duyệt
          </button>
          <button 
            style={{ 
              padding: '5px 10px', 
              backgroundColor: filter === 'approved' ? '#1e2e3e' : 'white', 
              color: filter === 'approved' ? 'white' : '#333', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              marginRight: '10px',
              cursor: 'pointer'
            }}
            onClick={() => setFilter('approved')}
          >
            Đã duyệt
          </button>
          <button 
            style={{ 
              padding: '5px 10px', 
              backgroundColor: filter === 'rejected' ? '#1e2e3e' : 'white', 
              color: filter === 'rejected' ? 'white' : '#333', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            onClick={() => setFilter('rejected')}
          >
            Từ chối
          </button>
        </div>
        <div>
          <button 
            style={{ 
              padding: '5px 10px', 
              backgroundColor: '#1e2e3e', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            onClick={fetchVisits}
          >
            Làm mới
          </button>
        </div>
      </div>
      
      {error && (
        <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>
          {error}
        </div>
      )}
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : filteredVisits.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p>Không có dữ liệu đăng ký nào.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', width: '100%', maxWidth: '100vw' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #eaeaea', tableLayout: 'fixed', minWidth: '1100px', maxWidth: '1600px' }}>
            <thead>
              <tr style={{ backgroundColor: '#1e2e3e', color: 'white' }}>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #eaeaea', fontSize: '14px', width: '7%' }}>Timestamp</th>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #eaeaea', fontSize: '14px', width: '10%' }}>Họ và tên</th>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #eaeaea', fontSize: '14px', width: '8%' }}>Điện thoại</th>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #eaeaea', fontSize: '14px', width: '13%' }}>Email</th>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #eaeaea', fontSize: '14px', width: '15%' }}>Trường Đại Học</th>
                <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #eaeaea', fontSize: '14px', width: '5%' }}>Tầng</th>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #eaeaea', fontSize: '14px', width: '8%' }}>Ngày đăng ký</th>
                <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #eaeaea', fontSize: '14px', width: '7%' }}>Khung giờ</th>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #eaeaea', fontSize: '14px', width: '12%' }}>Người liên hệ</th>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #eaeaea', fontSize: '14px', width: '8%' }}>Mục đích</th>
                <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #eaeaea', fontSize: '14px', width: '7%' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredVisits.map((visit, index) => (
                <tr key={visit.id} style={{ backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb' }}>
                  <td style={{ padding: '10px', borderBottom: '1px solid #eaeaea', fontSize: '13px', whiteSpace: 'nowrap' }}>
                    {visit.timestamp || new Date(visit.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #eaeaea', fontWeight: '500', fontSize: '13px' }}>
                    {visit.name.toUpperCase()}
                  </td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #eaeaea', fontSize: '13px', whiteSpace: 'nowrap' }}>
                    {visit.phone}
                  </td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #eaeaea', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {visit.email}
                  </td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #eaeaea', fontSize: '13px', overflow: 'visible', fontWeight: '500' }}>
                    {visit.school || 'Chưa có thông tin'}
                  </td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #eaeaea', fontSize: '13px', textAlign: 'center' }}>
                    {visit.floor || '4'}
                  </td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #eaeaea', fontSize: '13px', whiteSpace: 'nowrap' }}>
                    {formatDate(visit.date || visit.createdAt)}
                  </td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #eaeaea', fontSize: '13px', textAlign: 'center' }}>
                    {formatTime(visit.time) || '9:00'}
                  </td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #eaeaea', fontSize: '13px' }}>
                    {visit.contact || 'Chưa có thông tin'}
                  </td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #eaeaea', fontSize: '13px' }}>
                    {visit.purpose || 'Học tập'}
                  </td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #eaeaea', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', alignItems: 'center' }}>
                      {visit.status === 'approved' ? (
                        <>
                          <span style={{ color: 'green', backgroundColor: '#e6f4ea', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', marginRight: '5px' }}>Đã duyệt</span>
                          <button
                            onClick={() => handleEdit(visit.id)}
                            style={{
                              backgroundColor: 'transparent',
                              color: '#1e2e3e',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '16px',
                              padding: '0 5px'
                            }}
                            title="Sửa"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(visit.id)}
                            style={{
                              backgroundColor: 'transparent',
                              color: '#dc3545',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '16px',
                              padding: '0 5px'
                            }}
                            title="Xóa"
                          >
                            🗑️
                          </button>
                        </>
                      ) : visit.status === 'rejected' ? (
                        <>
                          <span style={{ color: 'red', backgroundColor: '#f8d7da', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', marginRight: '5px' }}>Từ chối</span>
                          <button
                            onClick={() => handleEdit(visit.id)}
                            style={{
                              backgroundColor: 'transparent',
                              color: '#1e2e3e',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '16px',
                              padding: '0 5px'
                            }}
                            title="Sửa"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(visit.id)}
                            style={{
                              backgroundColor: 'transparent',
                              color: '#dc3545',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '16px',
                              padding: '0 5px'
                            }}
                            title="Xóa"
                          >
                            🗑️
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => updateVisitStatus(visit.id, 'approved')}
                            style={{
                              backgroundColor: '#1e2e3e',
                              color: 'white',
                              border: 'none',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              marginRight: '5px'
                            }}
                          >
                            Duyệt
                          </button>
                          <button
                            onClick={() => updateVisitStatus(visit.id, 'rejected')}
                            style={{
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              marginRight: '5px'
                            }}
                          >
                            Từ chối
                          </button>
                          <button
                            onClick={() => handleEdit(visit.id)}
                            style={{
                              backgroundColor: 'transparent',
                              color: '#1e2e3e',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '16px',
                              padding: '0 5px'
                            }}
                            title="Sửa"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(visit.id)}
                            style={{
                              backgroundColor: 'transparent',
                              color: '#dc3545',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '16px',
                              padding: '0 5px'
                            }}
                            title="Xóa"
                          >
                            🗑️
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      )}
    </div>
  );
}
