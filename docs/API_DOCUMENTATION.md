# 📡 API 문서

배경화면 다운로드 웹사이트의 RESTful API 문서입니다.

## 📋 목차

- [기본 정보](#기본-정보)
- [인증](#인증)
- [응답 형식](#응답-형식)
- [오류 처리](#오류-처리)
- [배경화면 API](#배경화면-api)
- [테마 API](#테마-api)
- [사용자 좋아요 API](#사용자-좋아요-api)
- [파일 다운로드 API](#파일-다운로드-api)
- [예제 코드](#예제-코드)

## 🌐 기본 정보

### Base URL
```
http://localhost:3001/api
```

### Content-Type
```
application/json
```

### API 버전
```
v1 (현재 버전)
```

## 🔐 인증

현재 버전에서는 인증이 필요하지 않습니다. 사용자 식별은 세션 기반으로 처리됩니다.

## 📄 응답 형식

### 성공 응답

```json
{
  "success": true,
  "data": {
    // 응답 데이터
  },
  "message": "요청이 성공적으로 처리되었습니다."
}
```

### 페이지네이션 응답

```json
{
  "success": true,
  "data": {
    "items": [...],
    "totalCount": 100,
    "page": 1,
    "pageSize": 20,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## ❌ 오류 처리

### 오류 응답 형식

```json
{
  "success": false,
  "error": "WALLPAPER_NOT_FOUND",
  "message": "배경화면을 찾을 수 없습니다.",
  "statusCode": 404,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### HTTP 상태 코드

| 코드 | 설명 |
|------|------|
| 200 | 성공 |
| 201 | 생성됨 |
| 204 | 내용 없음 |
| 400 | 잘못된 요청 |
| 401 | 인증 필요 |
| 403 | 권한 없음 |
| 404 | 찾을 수 없음 |
| 409 | 충돌 |
| 500 | 서버 오류 |

## 🖼️ 배경화면 API

### 모든 배경화면 조회

```http
GET /api/wallpapers
```

#### 쿼리 파라미터

| 파라미터 | 타입 | 필수 | 설명 | 기본값 |
|----------|------|------|------|--------|
| page | number | 아니오 | 페이지 번호 | 1 |
| limit | number | 아니오 | 페이지 크기 | 20 |
| sortBy | string | 아니오 | 정렬 기준 | createdAt |
| sortOrder | string | 아니오 | 정렬 순서 (asc/desc) | desc |

#### 응답 예제

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "wp-001",
        "title": "아름다운 자연 풍경",
        "description": "푸른 산과 맑은 호수가 어우러진 자연 풍경",
        "themeId": "nature",
        "tags": ["자연", "산", "호수", "풍경"],
        "resolutions": [
          {
            "width": 1920,
            "height": 1080,
            "fileUrl": "/uploads/wallpapers/wp-001-1920x1080.jpg",
            "fileSize": 2048576
          },
          {
            "width": 2560,
            "height": 1440,
            "fileUrl": "/uploads/wallpapers/wp-001-2560x1440.jpg",
            "fileSize": 3145728
          }
        ],
        "thumbnailUrl": "/uploads/thumbnails/wp-001-thumb.jpg",
        "originalUrl": "/uploads/wallpapers/wp-001-original.jpg",
        "likeCount": 15,
        "downloadCount": 234,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "totalCount": 50,
    "page": 1,
    "pageSize": 20,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### 특정 배경화면 조회

```http
GET /api/wallpapers/:id
```

#### 경로 파라미터

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| id | string | 예 | 배경화면 ID |

#### 응답 예제

```json
{
  "success": true,
  "data": {
    "wallpaper": {
      "id": "wp-001",
      "title": "아름다운 자연 풍경",
      "description": "푸른 산과 맑은 호수가 어우러진 자연 풍경",
      "themeId": "nature",
      "tags": ["자연", "산", "호수", "풍경"],
      "resolutions": [
        {
          "width": 1920,
          "height": 1080,
          "fileUrl": "/uploads/wallpapers/wp-001-1920x1080.jpg",
          "fileSize": 2048576
        }
      ],
      "thumbnailUrl": "/uploads/thumbnails/wp-001-thumb.jpg",
      "originalUrl": "/uploads/wallpapers/wp-001-original.jpg",
      "likeCount": 15,
      "downloadCount": 234,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 테마별 배경화면 조회

```http
GET /api/wallpapers/theme/:theme
```

#### 경로 파라미터

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| theme | string | 예 | 테마 ID |

#### 쿼리 파라미터

페이지네이션 파라미터와 동일

#### 응답 예제

```json
{
  "success": true,
  "data": {
    "items": [
      // 해당 테마의 배경화면 목록
    ],
    "totalCount": 15,
    "page": 1,
    "pageSize": 20,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

### 배경화면 검색

```http
GET /api/wallpapers/search
```

#### 쿼리 파라미터

| 파라미터 | 타입 | 필수 | 설명 | 기본값 |
|----------|------|------|------|--------|
| q | string | 예 | 검색어 | - |
| page | number | 아니오 | 페이지 번호 | 1 |
| limit | number | 아니오 | 페이지 크기 | 20 |
| themeId | string | 아니오 | 테마 필터 | - |

#### 응답 예제

```json
{
  "success": true,
  "data": {
    "items": [
      // 검색 결과 배경화면 목록
    ],
    "totalCount": 8,
    "page": 1,
    "pageSize": 20,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false,
    "query": "자연",
    "suggestions": ["자연 풍경", "자연 배경", "자연 사진"]
  }
}
```

## 🎨 테마 API

### 모든 테마 조회

```http
GET /api/themes
```

#### 응답 예제

```json
{
  "success": true,
  "data": {
    "themes": [
      {
        "id": "nature",
        "name": "자연",
        "description": "자연의 아름다움을 담은 배경화면",
        "iconUrl": "/uploads/icons/nature-icon.svg",
        "wallpaperCount": 15,
        "isActive": true,
        "sortOrder": 1,
        "createdAt": "2024-01-01T00:00:00.000Z"
      },
      {
        "id": "space",
        "name": "우주",
        "description": "신비로운 우주와 별들의 배경화면",
        "iconUrl": "/uploads/icons/space-icon.svg",
        "wallpaperCount": 12,
        "isActive": true,
        "sortOrder": 2,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### 특정 테마 조회

```http
GET /api/themes/:id
```

#### 경로 파라미터

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| id | string | 예 | 테마 ID |

#### 응답 예제

```json
{
  "success": true,
  "data": {
    "theme": {
      "id": "nature",
      "name": "자연",
      "description": "자연의 아름다움을 담은 배경화면",
      "iconUrl": "/uploads/icons/nature-icon.svg",
      "wallpaperCount": 15,
      "isActive": true,
      "sortOrder": 1,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

## ❤️ 사용자 좋아요 API

### 사용자 좋아요 목록 조회

```http
GET /api/users/:userId/likes
```

#### 경로 파라미터

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| userId | string | 예 | 사용자 ID |

#### 응답 예제

```json
{
  "success": true,
  "data": {
    "likes": [
      {
        "id": "like-001",
        "userId": "user-123",
        "wallpaperId": "wp-001",
        "likedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "wallpapers": [
      {
        "id": "wp-001",
        "title": "아름다운 자연 풍경",
        // ... 배경화면 상세 정보
      }
    ]
  }
}
```

### 좋아요 추가

```http
POST /api/users/:userId/likes
```

#### 경로 파라미터

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| userId | string | 예 | 사용자 ID |

#### 요청 본문

```json
{
  "wallpaperId": "wp-001"
}
```

#### 응답 예제

```json
{
  "success": true,
  "data": {
    "like": {
      "id": "like-002",
      "userId": "user-123",
      "wallpaperId": "wp-001",
      "likedAt": "2024-01-01T00:00:00.000Z"
    }
  },
  "message": "좋아요가 추가되었습니다."
}
```

### 좋아요 제거

```http
DELETE /api/users/:userId/likes/:wallpaperId
```

#### 경로 파라미터

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| userId | string | 예 | 사용자 ID |
| wallpaperId | string | 예 | 배경화면 ID |

#### 응답 예제

```json
{
  "success": true,
  "message": "좋아요가 제거되었습니다."
}
```

## ⬇️ 파일 다운로드 API

### 배경화면 다운로드

```http
GET /api/download/:id/:resolution
```

#### 경로 파라미터

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| id | string | 예 | 배경화면 ID |
| resolution | string | 예 | 해상도 (예: 1920x1080) |

#### 응답

파일 다운로드가 시작됩니다. 응답 헤더에 다음 정보가 포함됩니다:

```http
Content-Type: image/jpeg
Content-Disposition: attachment; filename="wallpaper-001-1920x1080.jpg"
Content-Length: 2048576
```

### 다운로드 정보 조회

```http
GET /api/download/:id/:resolution/info
```

#### 응답 예제

```json
{
  "success": true,
  "data": {
    "downloadUrl": "/api/download/wp-001/1920x1080",
    "filename": "wallpaper-001-1920x1080.jpg",
    "fileSize": 2048576,
    "contentType": "image/jpeg"
  }
}
```

## 📁 정적 파일 서빙

### 배경화면 이미지

```http
GET /uploads/wallpapers/:filename
```

### 썸네일 이미지

```http
GET /uploads/thumbnails/:filename
```

### 테마 아이콘

```http
GET /uploads/icons/:filename
```

## 💻 예제 코드

### JavaScript/TypeScript

```typescript
// API 클라이언트 설정
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 10000,
});

// 모든 배경화면 조회
const getWallpapers = async (page = 1, limit = 20) => {
  try {
    const response = await apiClient.get('/wallpapers', {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching wallpapers:', error);
    throw error;
  }
};

// 특정 배경화면 조회
const getWallpaper = async (id: string) => {
  try {
    const response = await apiClient.get(`/wallpapers/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching wallpaper:', error);
    throw error;
  }
};

// 배경화면 검색
const searchWallpapers = async (query: string, page = 1) => {
  try {
    const response = await apiClient.get('/wallpapers/search', {
      params: { q: query, page }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching wallpapers:', error);
    throw error;
  }
};

// 좋아요 추가
const addLike = async (userId: string, wallpaperId: string) => {
  try {
    const response = await apiClient.post(`/users/${userId}/likes`, {
      wallpaperId
    });
    return response.data;
  } catch (error) {
    console.error('Error adding like:', error);
    throw error;
  }
};

// 좋아요 제거
const removeLike = async (userId: string, wallpaperId: string) => {
  try {
    const response = await apiClient.delete(`/users/${userId}/likes/${wallpaperId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing like:', error);
    throw error;
  }
};

// 파일 다운로드
const downloadWallpaper = async (id: string, resolution: string) => {
  try {
    const response = await apiClient.get(`/download/${id}/${resolution}`, {
      responseType: 'blob'
    });
    
    // 파일 다운로드 처리
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `wallpaper-${id}-${resolution}.jpg`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading wallpaper:', error);
    throw error;
  }
};
```

### React 컴포넌트 예제

```tsx
import React, { useState, useEffect } from 'react';
import { getWallpapers, addLike, removeLike } from '../api/wallpapers';

interface Wallpaper {
  id: string;
  title: string;
  thumbnailUrl: string;
  // ... 기타 필드
}

const WallpaperGallery: React.FC = () => {
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWallpapers = async () => {
      try {
        setLoading(true);
        const response = await getWallpapers();
        setWallpapers(response.data.items);
      } catch (err) {
        setError('배경화면을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchWallpapers();
  }, []);

  const handleLike = async (wallpaperId: string) => {
    try {
      await addLike('current-user', wallpaperId);
      // UI 업데이트 로직
    } catch (error) {
      console.error('좋아요 추가 실패:', error);
    }
  };

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>오류: {error}</div>;

  return (
    <div className="wallpaper-gallery">
      {wallpapers.map(wallpaper => (
        <div key={wallpaper.id} className="wallpaper-card">
          <img src={wallpaper.thumbnailUrl} alt={wallpaper.title} />
          <h3>{wallpaper.title}</h3>
          <button onClick={() => handleLike(wallpaper.id)}>
            좋아요
          </button>
        </div>
      ))}
    </div>
  );
};

export default WallpaperGallery;
```

### cURL 예제

```bash
# 모든 배경화면 조회
curl -X GET "http://localhost:3001/api/wallpapers?page=1&limit=10"

# 특정 배경화면 조회
curl -X GET "http://localhost:3001/api/wallpapers/wp-001"

# 배경화면 검색
curl -X GET "http://localhost:3001/api/wallpapers/search?q=자연"

# 좋아요 추가
curl -X POST "http://localhost:3001/api/users/user-123/likes" \
  -H "Content-Type: application/json" \
  -d '{"wallpaperId": "wp-001"}'

# 좋아요 제거
curl -X DELETE "http://localhost:3001/api/users/user-123/likes/wp-001"

# 파일 다운로드
curl -X GET "http://localhost:3001/api/download/wp-001/1920x1080" \
  -o "wallpaper.jpg"
```

## 🔄 API 버전 관리

현재는 v1 API만 제공하지만, 향후 버전 관리를 위한 계획:

```http
# 현재
GET /api/wallpapers

# 향후 버전 관리
GET /api/v1/wallpapers
GET /api/v2/wallpapers
```

## 📊 속도 제한 (Rate Limiting)

현재는 속도 제한이 없지만, 향후 도입 예정:

```http
# 응답 헤더에 포함될 정보
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## 🔍 필터링 및 정렬

### 고급 필터링 (향후 지원 예정)

```http
GET /api/wallpapers?filter[themeId]=nature&filter[tags]=산,호수
```

### 정렬 옵션

```http
GET /api/wallpapers?sortBy=likeCount&sortOrder=desc
GET /api/wallpapers?sortBy=downloadCount&sortOrder=desc
GET /api/wallpapers?sortBy=createdAt&sortOrder=asc
```

## 📝 변경 로그

### v1.0.0 (2024-01-01)
- 초기 API 릴리스
- 배경화면, 테마, 좋아요 API 구현
- 파일 다운로드 기능 추가

---

이 API 문서는 지속적으로 업데이트됩니다. 질문이나 개선 사항이 있으면 GitHub Issues를 통해 문의해 주세요.