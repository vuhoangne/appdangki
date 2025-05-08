const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3001', 'http://localhost:3002'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

const PORT = 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3002'],
  credentials: true
}));
app.use(express.json());

// Đảm bảo file dữ liệu tồn tại
const dataDir = path.join(__dirname, '..', 'data');
const dataPath = path.join(dataDir, 'visits.json');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(dataPath)) {
  fs.writeFileSync(dataPath, JSON.stringify([]));
}

// Routes
app.get('/api/visits', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Không thể đọc dữ liệu' });
  }
});

app.post('/api/visits', (req, res) => {
  try {
    const { name, email, phone, date, purpose, school, department, time, contact, purposeDetail } = req.body;
    
    if (!name || !email || !phone || !date || !purpose) {
      return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin' });
    }
    
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    const newVisit = {
      id: Date.now().toString(),
      name,
      email,
      phone,
      school,
      date,
      purpose,
      department,
      time,
      contact,
      note: purposeDetail,
      floor: department ? department.replace('Tầng ', '') : '',
      status: 'pending',
      createdAt: new Date().toISOString(),
      timestamp: new Date().toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    
    data.push(newVisit);
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    
    // Thông báo cho tất cả client rằng có đăng ký mới
    io.emit('new-registration', newVisit);
    
    res.status(201).json(newVisit);
  } catch (error) {
    res.status(500).json({ error: 'Không thể lưu dữ liệu' });
  }
});

app.put('/api/visits/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Vui lòng cung cấp trạng thái' });
    }
    
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const visitIndex = data.findIndex(visit => visit.id === id);
    
    if (visitIndex === -1) {
      return res.status(404).json({ error: 'Không tìm thấy lượt đăng ký' });
    }
    
    data[visitIndex].status = status;
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    
    // Thông báo cho tất cả client rằng có đăng ký được cập nhật
    io.emit('update-registration', data[visitIndex]);
    
    res.json(data[visitIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Không thể cập nhật dữ liệu' });
  }
});

// API Routes
// Đăng nhập admin
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  // Kiểm tra thông tin đăng nhập
  if (username === 'admin' && password === 'admin123321') {
    res.status(200).json({ 
      success: true, 
      message: 'Đăng nhập thành công',
      user: { username: 'admin', role: 'admin' }
    });
  } else {
    res.status(401).json({ 
      success: false, 
      message: 'Tên đăng nhập hoặc mật khẩu không đúng' 
    });
  }
});

// API xóa đăng ký
app.delete('/api/visits/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const visitIndex = data.findIndex(visit => visit.id === id);
    
    if (visitIndex === -1) {
      return res.status(404).json({ error: 'Không tìm thấy lượt đăng ký' });
    }
    
    // Xóa đăng ký khỏi mảng
    const deletedVisit = data.splice(visitIndex, 1)[0];
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    
    // Thông báo cho tất cả client rằng có đăng ký bị xóa
    io.emit('delete-registration', id);
    
    res.json({ success: true, message: 'Đã xóa đăng ký thành công', deletedVisit });
  } catch (error) {
    console.error('Error deleting visit:', error);
    res.status(500).json({ error: 'Không thể xóa dữ liệu' });
  }
});

// Tài khoản admin mặc định
const adminAccount = {
  username: 'admin',
  password: 'admin123', // Mật khẩu đã được mã hóa trong thực tế
};

// API đăng nhập
app.post('/api/login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (username === adminAccount.username && password === adminAccount.password) {
      res.json({ success: true, message: 'Đăng nhập thành công' });
    } else {
      res.status(401).json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// Route mặc định
app.get('/', (req, res) => {
  res.json({ message: 'API Đăng Ký Văn Phòng' });
});

// Thêm sự kiện kết nối cho Socket.IO
io.on('connection', (socket) => {
  console.log('Client kết nối:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client ngắt kết nối:', socket.id);
  });
});

// Sử dụng server thay vì app để hỗ trợ Socket.IO
server.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
