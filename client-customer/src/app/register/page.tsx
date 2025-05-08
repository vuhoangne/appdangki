"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { io } from 'socket.io-client';

interface FormData {
  name: string;
  email: string;
  phone: string;
  school: string;
  department: string;
  date: string;
  time: string;
  timeOfDay: string;
  purpose: string;
  purposeDetail?: string;
  contact?: string;
}

export default function RegisterPage(): React.ReactElement {
  // Khởi tạo kết nối Socket.IO
  const socketRef = React.useRef<any>(null);
  
  useEffect(() => {
    // Thiết lập kết nối Socket.IO
    socketRef.current = io('http://localhost:3000');
    
    // Dọn dẹp khi component unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    school: '',
    department: '',
    date: '',
    time: '',
    timeOfDay: '',
    purpose: '',
    purposeDetail: '',
    contact: ''
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [submissionData, setSubmissionData] = useState<{
    name: string;
    time: string;
    date: string;
  }>({ name: '', time: '', date: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Kiểm tra số điện thoại chỉ chứa số
    const phoneRegex = /^[0-9]+$/;
    if (!phoneRegex.test(formData.phone)) {
      setMessage('Số điện thoại chỉ được chứa số');
      setLoading(false);
      return;
    }

    // Kiểm tra email có chứa @
    if (!formData.email.includes('@')) {
      setMessage('Email phải chứa ký tự @');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/visits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        const currentDate = new Date();
        const formattedDate = `${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`;
        const formattedTime = `${currentDate.getHours()}:${currentDate.getMinutes().toString().padStart(2, '0')}`;
        
        // Lưu thông tin đăng ký thành công
        setSubmissionData({
          name: formData.name,
          time: formattedTime,
          date: formattedDate
        });
        
        // Chuyển sang trạng thái đã gửi
        setIsSubmitted(true);
        
        // Thông báo cho admin rằng có đăng ký mới (không cần vì server đã tự động gửi thông báo)
        console.log('Đã gửi đăng ký thành công');
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          school: '',
          department: '',
          date: '',
          time: '',
          timeOfDay: '',
          purpose: '',
          purposeDetail: '',
          contact: ''
        });
      } else {
        setMessage(`Lỗi: ${data.error}`);
      }
    } catch (error) {
      setMessage('Đã xảy ra lỗi khi gửi đăng ký. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Hiển thị trang thông báo đăng ký thành công
  if (isSubmitted) {
    return (
      <div className="success-page">
        <div className="card">
          <div className="success-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <h1 className="success-title">Đăng ký thành công!</h1>
          <p className="success-message">
            Đăng ký thành công cho "{submissionData.name}" vào lúc {submissionData.time} ngày {submissionData.date}.
          </p>
          <p className="success-details">
            Chúng tôi sẽ liên hệ với bạn sớm. Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.
          </p>
          <button 
            className="btn btn-primary" 
            onClick={() => {
              setIsSubmitted(false);
              setMessage('');
            }}
          >
            Đăng ký mới
          </button>
        </div>
      </div>
    );
  }

  // Hiển thị form đăng ký
  return (
    <div>
      
      {message && (
        <div className={message.includes('thành công') ? 'alert alert-success' : 'alert alert-error'}>
          {message}
        </div>
      )}
      
      <div className="card">
        <h1 className="card-title">Đăng ký lên văn phòng</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Họ và tên"
              required
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="Số điện thoại"
              required
              pattern="[0-9]*"
              title="Số điện thoại chỉ được chứa số"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Email"
              required
              pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
              title="Email phải đúng định dạng và chứa ký tự @"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <input
              id="school"
              name="school"
              type="text"
              placeholder="Trường đại học"
              value={formData.school || ''}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <select name="purpose" onChange={handleChange} value={formData.purpose || ''} required>
                <option value="" disabled>Chọn mục đích</option>
                <option value="Học tập">Học tập</option>
                <option value="Thực tập">Thực tập</option>
                <option value="Làm việc">Làm việc</option>
              </select>
            </div>
            
            <div className="form-group">
              <input
                id="time"
                name="time"
                type="time"
                placeholder="Giờ"
                required
                value={formData.time || ''}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
              >
                <option value="" disabled>
                  Chọn tầng
                </option>
                <option value="Tầng 26">Tầng 26</option>
                <option value="Tầng 36">Tầng 36</option>
                <option value="Tầng 46">Tầng 46</option>
              </select>
            </div>

            <div className="form-group">
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <select
              name="contact"
              value={formData.contact || ''}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Chọn người liên hệ</option>
              <option value="Hoàng Kha - 0367242327">Hoàng Kha - 0367242327</option>
              <option value="Vũ Hoàng - 0937036966">Vũ Hoàng - 0937036966</option>
            </select>
          </div>
          
          <div className="form-group">
            <textarea
              id="purposeDetail"
              name="purposeDetail"
              placeholder="Ghi chú (nếu có)"
              value={formData.purposeDetail || ''}
              onChange={handleChange}
            ></textarea>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Đang xử lý...' : 'Gửi đăng ký'}
          </button>
        </form>
      </div>
    </div>
  );
}
