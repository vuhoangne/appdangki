import express, { Request, Response } from 'express';
import cors from 'cors';
import * as fs from 'fs';
import * as path from 'path';

interface Visit {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

const app = express();
const PORT = 4000;

// Middleware
app.use(cors());
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
app.get('/api/visits', (req: Request, res: Response) => {
  try {
    const data: Visit[] = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Không thể đọc dữ liệu' });
  }
});

app.post('/api/visits', (req: Request, res: Response) => {
  try {
    const { name, email, phone, date, purpose } = req.body;
    
    if (!name || !email || !phone || !date || !purpose) {
      return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin' });
    }
    
    const data: Visit[] = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    const newVisit: Visit = {
      id: Date.now().toString(),
      name,
      email,
      phone,
      date,
      purpose,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    data.push(newVisit);
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    
    res.status(201).json(newVisit);
  } catch (error) {
    res.status(500).json({ error: 'Không thể lưu dữ liệu' });
  }
});

app.put('/api/visits/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Vui lòng cung cấp trạng thái' });
    }
    
    const data: Visit[] = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const visitIndex = data.findIndex(visit => visit.id === id);
    
    if (visitIndex === -1) {
      return res.status(404).json({ error: 'Không tìm thấy lượt đăng ký' });
    }
    
    data[visitIndex].status = status as 'pending' | 'approved' | 'rejected';
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    
    res.json(data[visitIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Không thể cập nhật dữ liệu' });
  }
});

// Route mặc định
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'API Đăng Ký Văn Phòng' });
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
