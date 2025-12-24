/**
 * 간단한 관리자 서버 (JavaScript)
 * 기존 TypeScript 코드와 독립적으로 작동
 */

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.ADMIN_PORT || 3002;

// 환경변수에서 관리자 키 가져오기
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'your-super-secret-admin-key-here';

// 미들웨어 설정
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// 관리자 인증 미들웨어
function adminAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        success: false, 
        message: '인증 헤더가 필요합니다' 
      });
    }
    
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;
    
    if (token !== ADMIN_SECRET_KEY) {
      return res.status(401).json({ 
        success: false, 
        message: '유효하지 않은 관리자 키입니다' 
      });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: '인증 처리 중 오류가 발생했습니다' 
    });
  }
}

// 파일 업로드 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('지원하지 않는 파일 형식입니다. JPEG, PNG, WebP만 허용됩니다.'));
    }
  }
});

// 정적 파일 서빙
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 관리자 상태 확인
app.get('/api/admin/status', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.json({ isAdmin: false });
    }
    
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;
    
    const isAdmin = token === ADMIN_SECRET_KEY;
    
    res.json({ isAdmin });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: '상태 확인 중 오류가 발생했습니다' 
    });
  }
});

// 배경화면 업로드
app.post('/api/admin/wallpapers', adminAuth, upload.single('wallpaper'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '배경화면 파일이 필요합니다'
      });
    }

    const { title, description, tags, theme } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: '배경화면 제목이 필요합니다'
      });
    }

    // 태그 파싱
    let parsedTags = [];
    if (tags) {
      if (typeof tags === 'string') {
        parsedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      } else if (Array.isArray(tags)) {
        parsedTags = tags;
      }
    }

    // 기존 배경화면 데이터 로드
    const wallpapersPath = path.join(__dirname, 'src/data/wallpapers.json');
    
    // 데이터 디렉토리가 없으면 생성
    const dataDir = path.dirname(wallpapersPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    let wallpapers = [];
    
    if (fs.existsSync(wallpapersPath)) {
      const data = fs.readFileSync(wallpapersPath, 'utf8');
      wallpapers = JSON.parse(data);
    }

    // 새 배경화면 데이터 생성
    const baseUrl = process.env.BASE_URL || 'http://localhost:3002';
    const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;
    
    // 기본 해상도들 (실제로는 이미지 처리 라이브러리로 리사이징해야 함)
    const resolutions = [
      {
        width: 1920,
        height: 1080,
        fileUrl: fileUrl,
        fileSize: req.file.size
      },
      {
        width: 2560,
        height: 1440,
        fileUrl: fileUrl,
        fileSize: req.file.size
      },
      {
        width: 3840,
        height: 2160,
        fileUrl: fileUrl,
        fileSize: req.file.size
      }
    ];
    
    const newWallpaper = {
      id: uuidv4(),
      title: title.trim(),
      description: description?.trim() || '',
      themeId: theme || 'general',
      tags: parsedTags,
      resolutions: resolutions,
      thumbnailUrl: fileUrl,
      originalUrl: fileUrl,
      likeCount: 0,
      downloadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 배경화면 추가 및 저장
    wallpapers.push(newWallpaper);
    fs.writeFileSync(wallpapersPath, JSON.stringify(wallpapers, null, 2));

    // 테마의 배경화면 개수 업데이트
    try {
      const themesPath = path.join(__dirname, 'src/data/themes.json');
      if (fs.existsSync(themesPath)) {
        const themesData = fs.readFileSync(themesPath, 'utf8');
        const themes = JSON.parse(themesData);
        
        // 해당 테마의 wallpaperCount 증가
        const themeIndex = themes.findIndex(t => t.id === (theme || 'general'));
        if (themeIndex !== -1) {
          themes[themeIndex].wallpaperCount = (themes[themeIndex].wallpaperCount || 0) + 1;
          fs.writeFileSync(themesPath, JSON.stringify(themes, null, 2));
        }
      }
    } catch (themeUpdateError) {
      console.error('테마 개수 업데이트 실패:', themeUpdateError);
      // 테마 업데이트 실패해도 배경화면 업로드는 성공으로 처리
    }

    res.status(201).json({
      success: true,
      data: newWallpaper,
      message: '배경화면이 성공적으로 업로드되었습니다'
    });
  } catch (error) {
    console.error('업로드 오류:', error);
    
    // 업로드 실패 시 파일 삭제
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (deleteError) {
        console.error('임시 파일 삭제 실패:', deleteError);
      }
    }
    
    res.status(500).json({
      success: false,
      message: '업로드 중 오류가 발생했습니다'
    });
  }
});

// 배경화면 삭제
app.delete('/api/admin/wallpapers/:id', adminAuth, (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: '배경화면 ID가 필요합니다'
      });
    }

    // 기존 배경화면 데이터 로드
    const wallpapersPath = path.join(__dirname, 'src/data/wallpapers.json');
    
    if (!fs.existsSync(wallpapersPath)) {
      return res.status(400).json({
        success: false,
        message: '배경화면 데이터를 찾을 수 없습니다'
      });
    }

    const data = fs.readFileSync(wallpapersPath, 'utf8');
    const wallpapers = JSON.parse(data);
    
    // 삭제할 배경화면 찾기
    const wallpaperIndex = wallpapers.findIndex(wp => wp.id === id);
    
    if (wallpaperIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '요청한 배경화면을 찾을 수 없습니다'
      });
    }

    const wallpaper = wallpapers[wallpaperIndex];

    // 파일 시스템에서 이미지 파일 삭제
    try {
      const uploadsDir = path.join(__dirname, 'uploads');
      
      for (const resolution of wallpaper.resolutions) {
        const filename = path.basename(resolution.fileUrl);
        const filePath = path.join(uploadsDir, filename);
        
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    } catch (error) {
      console.error('파일 삭제 중 오류 발생:', error);
    }

    // 배경화면 목록에서 제거
    wallpapers.splice(wallpaperIndex, 1);
    
    // 파일에 저장
    fs.writeFileSync(wallpapersPath, JSON.stringify(wallpapers, null, 2));

    // 테마의 배경화면 개수 업데이트
    try {
      const themesPath = path.join(__dirname, 'src/data/themes.json');
      if (fs.existsSync(themesPath)) {
        const themesData = fs.readFileSync(themesPath, 'utf8');
        const themes = JSON.parse(themesData);
        
        // 해당 테마의 wallpaperCount 감소
        const themeIndex = themes.findIndex(t => t.id === wallpaper.themeId);
        if (themeIndex !== -1) {
          themes[themeIndex].wallpaperCount = Math.max(0, (themes[themeIndex].wallpaperCount || 0) - 1);
          fs.writeFileSync(themesPath, JSON.stringify(themes, null, 2));
        }
      }
    } catch (themeUpdateError) {
      console.error('테마 개수 업데이트 실패:', themeUpdateError);
      // 테마 업데이트 실패해도 배경화면 삭제는 성공으로 처리
    }

    res.json({
      success: true,
      message: '배경화면이 성공적으로 삭제되었습니다'
    });
  } catch (error) {
    console.error('삭제 오류:', error);
    res.status(500).json({
      success: false,
      message: '삭제 중 오류가 발생했습니다'
    });
  }
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🔧 관리자 서버가 포트 ${PORT}에서 실행 중입니다`);
  console.log(`📁 업로드 디렉토리: ${path.join(__dirname, 'uploads')}`);
  console.log(`🔑 관리자 키: ${ADMIN_SECRET_KEY}`);
});

module.exports = app;