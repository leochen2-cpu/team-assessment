import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import assessmentRoutes from './routes/assessmentRoutes';
import adminRoutes from './routes/adminRoutes';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// 测试路由
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend Server working properly',
    timestamp: new Date().toISOString()
  });
});

// API路由
app.use('/api/assessments', assessmentRoutes);
app.use('/api/admin', adminRoutes);

// 错误处理中间件
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Server Internal Error',
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Backend Server At: http://localhost:${PORT}`);
  console.log(`Test interface: http://localhost:${PORT}/api/health`);
  console.log(`Run time: ${new Date().toLocaleString('zh-CN')}`);
});

export default app;
