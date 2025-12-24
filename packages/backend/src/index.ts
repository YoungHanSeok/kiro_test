/**
 * 백엔드 애플리케이션 진입점
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import wallpaperRouter from './routes/wallpaper-router';
import themeRouter from './routes/theme-router';
import userRouter from './routes/user-router';
import downloadRouter from './routes/download-router';
import adminRouter from './routes/admin-router';
import { globalErrorHandler } from './middleware/error-handler';

/**
 * Express 애플리케이션 생성 함수
 * 테스트에서 사용할 수 있도록 분리
 */
export function createApp(): express.Application {
  const app = express();

// 보안 미들웨어
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:", "*"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "http://localhost:*", "ws://localhost:*"]
    }
  }
}));

// CORS 설정
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:3002', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Access-Control-Allow-Origin'],
  exposedHeaders: ['Content-Length', 'Content-Type']
}));

// 로깅 미들웨어
app.use(morgan('combined'));

// JSON 파싱 미들웨어
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 정적 파일 서빙 (업로드된 이미지)
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  // CORS 헤더 추가
  setHeaders: (res, filePath) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// 기본 라우터 구조
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'wallpaper-website-backend'
  });
});

  // API 라우터
  app.use('/api/wallpapers', wallpaperRouter);
  app.use('/api/themes', themeRouter);
  app.use('/api/users', userRouter);
  app.use('/api/download', downloadRouter);
  app.use('/api/admin', adminRouter);

  // 404 핸들러
  app.use('*', (req, res) => {
    res.status(404).json({ 
      success: false,
      message: '요청한 리소스를 찾을 수 없습니다',
      errorCode: 'RESOURCE_NOT_FOUND'
    });
  });

  // 전역 오류 처리 미들웨어
  app.use(globalErrorHandler);

  return app;
}

// 애플리케이션 인스턴스 생성
const app = createApp();
const PORT = process.env.PORT || 3001;

// 서버 시작
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 백엔드 서버가 포트 ${PORT}에서 실행 중입니다`);
    console.log(`📁 정적 파일 경로: ${path.join(__dirname, '../uploads')}`);
  });
}

export default app;