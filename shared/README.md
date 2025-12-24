# 📦 공통 패키지 (Shared)

프론트엔드와 백엔드에서 공통으로 사용하는 TypeScript 타입 정의, 인터페이스, 유틸리티 함수를 제공하는 패키지입니다.

## 📋 주요 기능

- 🔧 **공통 타입 정의**: 배경화면, 테마, 사용자 관련 인터페이스
- 🛠️ **유틸리티 함수**: 데이터 검증, 상수 정의
- 📡 **API 타입**: 요청/응답 인터페이스 정의
- ✅ **검증 함수**: 데이터 무결성 검증 로직

## 🏗️ 프로젝트 구조

```
src/
├── types/              # 타입 정의
│   ├── wallpaper.ts   # 배경화면 관련 타입
│   └── api.ts         # API 관련 타입
├── utils/             # 유틸리티 함수
│   ├── validation.ts  # 데이터 검증 함수
│   └── constants.ts   # 상수 정의
└── index.ts          # 패키지 진입점
```

## 🔧 설치 및 사용

### 의존성 설치

```bash
# 루트에서 실행
npm install

# 또는 공통 패키지만 설치
npm install --workspace=shared
```

### 빌드

```bash
# 공통 패키지 빌드
npm run build --workspace=shared

# 또는 공통 패키지 디렉토리에서
cd shared
npm run build
```

### 감시 모드

```bash
# 개발 중 자동 빌드
npm run dev --workspace=shared
```

## 📝 타입 정의

### 배경화면 타입 (wallpaper.ts)

```typescript
export interface Wallpaper {
  id: string;                    // 고유 식별자
  title: string;                 // 배경화면 제목
  description?: string;          // 설명
  themeId: string;              // 테마 ID
  tags: string[];               // 검색용 태그
  resolutions: Resolution[];     // 사용 가능한 해상도 목록
  thumbnailUrl: string;         // 썸네일 이미지 URL
  originalUrl: string;          // 원본 이미지 URL
  likeCount: number;            // 좋아요 수
  downloadCount: number;        // 다운로드 수
  createdAt: Date;              // 생성일
  updatedAt: Date;              // 수정일
}

export interface Resolution {
  width: number;                // 가로 해상도
  height: number;               // 세로 해상도
  fileUrl: string;              // 해당 해상도 파일 URL
  fileSize: number;             // 파일 크기 (bytes)
}

export interface Theme {
  id: string;                   // 고유 식별자
  name: string;                 // 테마 이름
  description: string;          // 테마 설명
  iconUrl?: string;             // 테마 아이콘 URL
  wallpaperCount: number;       // 해당 테마의 배경화면 수
  isActive: boolean;            // 활성화 상태
  sortOrder: number;            // 정렬 순서
  createdAt: Date;              // 생성일
}

export interface UserLike {
  id: string;                   // 고유 식별자
  userId: string;               // 사용자 ID (세션 기반)
  wallpaperId: string;          // 배경화면 ID
  likedAt: Date;                // 좋아요 표시 시간
}

export interface SearchResult {
  wallpapers: Wallpaper[];      // 검색된 배경화면 목록
  totalCount: number;           // 전체 결과 수
  page: number;                 // 현재 페이지
  pageSize: number;             // 페이지 크기
  hasMore: boolean;             // 추가 결과 존재 여부
}
```

### API 타입 (api.ts)

```typescript
// 기본 API 응답 타입
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 페이지네이션 타입
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// 배경화면 API 타입
export interface GetWallpapersParams extends PaginationParams {
  themeId?: string;
  tags?: string[];
  search?: string;
}

export interface GetWallpapersResponse extends PaginatedResponse<Wallpaper> {}

export interface GetWallpaperResponse {
  wallpaper: Wallpaper;
}

// 테마 API 타입
export interface GetThemesResponse {
  themes: Theme[];
}

export interface GetThemeResponse {
  theme: Theme;
}

// 사용자 좋아요 API 타입
export interface AddLikeRequest {
  wallpaperId: string;
}

export interface AddLikeResponse {
  like: UserLike;
}

export interface GetUserLikesResponse {
  likes: UserLike[];
  wallpapers: Wallpaper[];
}

// 검색 API 타입
export interface SearchWallpapersParams extends PaginationParams {
  query: string;
  themeId?: string;
}

export interface SearchWallpapersResponse extends PaginatedResponse<Wallpaper> {
  query: string;
  suggestions?: string[];
}

// 다운로드 API 타입
export interface DownloadRequest {
  wallpaperId: string;
  resolution: string;
}

export interface DownloadResponse {
  downloadUrl: string;
  filename: string;
  fileSize: number;
}

// 오류 응답 타입
export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
}
```

## 🛠️ 유틸리티 함수

### 검증 함수 (validation.ts)

```typescript
import { Wallpaper, Theme, UserLike, Resolution } from '../types/wallpaper';

// 배경화면 데이터 검증
export function isValidWallpaper(data: any): data is Wallpaper {
  return (
    typeof data === 'object' &&
    typeof data.id === 'string' &&
    typeof data.title === 'string' &&
    typeof data.themeId === 'string' &&
    Array.isArray(data.tags) &&
    Array.isArray(data.resolutions) &&
    typeof data.thumbnailUrl === 'string' &&
    typeof data.originalUrl === 'string' &&
    typeof data.likeCount === 'number' &&
    typeof data.downloadCount === 'number' &&
    data.resolutions.every(isValidResolution)
  );
}

// 해상도 데이터 검증
export function isValidResolution(data: any): data is Resolution {
  return (
    typeof data === 'object' &&
    typeof data.width === 'number' &&
    typeof data.height === 'number' &&
    typeof data.fileUrl === 'string' &&
    typeof data.fileSize === 'number' &&
    data.width > 0 &&
    data.height > 0 &&
    data.fileSize > 0
  );
}

// 테마 데이터 검증
export function isValidTheme(data: any): data is Theme {
  return (
    typeof data === 'object' &&
    typeof data.id === 'string' &&
    typeof data.name === 'string' &&
    typeof data.description === 'string' &&
    typeof data.wallpaperCount === 'number' &&
    typeof data.isActive === 'boolean' &&
    typeof data.sortOrder === 'number'
  );
}

// 사용자 좋아요 데이터 검증
export function isValidUserLike(data: any): data is UserLike {
  return (
    typeof data === 'object' &&
    typeof data.id === 'string' &&
    typeof data.userId === 'string' &&
    typeof data.wallpaperId === 'string' &&
    data.likedAt instanceof Date
  );
}

// 검색어 검증
export function isValidSearchQuery(query: string): boolean {
  return (
    typeof query === 'string' &&
    query.trim().length > 0 &&
    query.trim().length <= 100
  );
}

// 해상도 문자열 검증
export function isValidResolutionString(resolution: string): boolean {
  const resolutionPattern = /^\d+x\d+$/;
  return resolutionPattern.test(resolution);
}

// 파일 확장자 검증
export function isValidImageExtension(filename: string): boolean {
  const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.svg'];
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return validExtensions.includes(extension);
}

// 페이지네이션 파라미터 검증
export function isValidPaginationParams(params: any): boolean {
  return (
    (!params.page || (typeof params.page === 'number' && params.page > 0)) &&
    (!params.limit || (typeof params.limit === 'number' && params.limit > 0 && params.limit <= 100)) &&
    (!params.sortBy || typeof params.sortBy === 'string') &&
    (!params.sortOrder || ['asc', 'desc'].includes(params.sortOrder))
  );
}
```

### 상수 정의 (constants.ts)

```typescript
// API 관련 상수
export const API_ENDPOINTS = {
  WALLPAPERS: '/wallpapers',
  THEMES: '/themes',
  USERS: '/users',
  DOWNLOAD: '/download',
  SEARCH: '/search',
} as const;

// 페이지네이션 기본값
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// 이미지 관련 상수
export const IMAGE_CONSTANTS = {
  THUMBNAIL_SIZE: {
    WIDTH: 300,
    HEIGHT: 200,
  },
  SUPPORTED_FORMATS: ['jpg', 'jpeg', 'png', 'webp', 'svg'],
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
} as const;

// 해상도 상수
export const COMMON_RESOLUTIONS = [
  { width: 1920, height: 1080, label: 'Full HD' },
  { width: 2560, height: 1440, label: '2K QHD' },
  { width: 3840, height: 2160, label: '4K UHD' },
  { width: 1366, height: 768, label: 'HD' },
  { width: 1280, height: 720, label: 'HD 720p' },
] as const;

// 테마 관련 상수
export const THEME_CONSTANTS = {
  DEFAULT_THEME: 'all',
  MAX_THEMES: 20,
} as const;

// 검색 관련 상수
export const SEARCH_CONSTANTS = {
  MIN_QUERY_LENGTH: 1,
  MAX_QUERY_LENGTH: 100,
  DEBOUNCE_DELAY: 300,
} as const;

// 좋아요 관련 상수
export const LIKE_CONSTANTS = {
  MAX_LIKES_PER_USER: 1000,
} as const;

// HTTP 상태 코드
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// 오류 메시지
export const ERROR_MESSAGES = {
  WALLPAPER_NOT_FOUND: '배경화면을 찾을 수 없습니다.',
  THEME_NOT_FOUND: '테마를 찾을 수 없습니다.',
  INVALID_RESOLUTION: '유효하지 않은 해상도입니다.',
  INVALID_SEARCH_QUERY: '유효하지 않은 검색어입니다.',
  LIKE_ALREADY_EXISTS: '이미 좋아요를 표시한 배경화면입니다.',
  LIKE_NOT_FOUND: '좋아요를 찾을 수 없습니다.',
  FILE_NOT_FOUND: '파일을 찾을 수 없습니다.',
  INVALID_FILE_FORMAT: '지원하지 않는 파일 형식입니다.',
  FILE_TOO_LARGE: '파일 크기가 너무 큽니다.',
  NETWORK_ERROR: '네트워크 오류가 발생했습니다.',
  SERVER_ERROR: '서버 오류가 발생했습니다.',
} as const;
```

## 🧪 테스트

### 테스트 실행

```bash
# 모든 테스트 실행
npm test

# 테스트 감시 모드
npm run test:watch

# 커버리지 리포트
npm run test:coverage
```

### 테스트 구조

```
src/
└── utils/
    └── validation.test.ts    # 검증 함수 테스트
```

### 테스트 예제

```typescript
// validation.test.ts
import { isValidWallpaper, isValidResolution } from './validation';

describe('validation', () => {
  describe('isValidWallpaper', () => {
    it('유효한 배경화면 데이터를 검증한다', () => {
      const validWallpaper = {
        id: 'wp-001',
        title: '테스트 배경화면',
        themeId: 'nature',
        tags: ['자연', '풍경'],
        resolutions: [
          {
            width: 1920,
            height: 1080,
            fileUrl: '/uploads/wp-001-1920x1080.jpg',
            fileSize: 2048576
          }
        ],
        thumbnailUrl: '/uploads/thumbnails/wp-001-thumb.jpg',
        originalUrl: '/uploads/wallpapers/wp-001-original.jpg',
        likeCount: 0,
        downloadCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(isValidWallpaper(validWallpaper)).toBe(true);
    });

    it('유효하지 않은 배경화면 데이터를 거부한다', () => {
      const invalidWallpaper = {
        id: 'wp-001',
        // title 누락
        themeId: 'nature',
        tags: ['자연'],
        resolutions: [],
        thumbnailUrl: '/uploads/thumbnails/wp-001-thumb.jpg',
        originalUrl: '/uploads/wallpapers/wp-001-original.jpg',
        likeCount: 0,
        downloadCount: 0
      };

      expect(isValidWallpaper(invalidWallpaper)).toBe(false);
    });
  });
});
```

## 📦 패키지 사용법

### 다른 패키지에서 사용

```typescript
// 백엔드에서 사용
import { Wallpaper, isValidWallpaper, API_ENDPOINTS } from '@wallpaper-website/shared';

// 프론트엔드에서 사용
import { Theme, SearchResult, PAGINATION_DEFAULTS } from '@wallpaper-website/shared';
```

### 타입 가드 활용

```typescript
// 런타임 타입 검증
function processWallpaperData(data: unknown) {
  if (isValidWallpaper(data)) {
    // 이제 data는 Wallpaper 타입으로 추론됨
    console.log(data.title);
    console.log(data.resolutions.length);
  } else {
    throw new Error('Invalid wallpaper data');
  }
}
```

## 🔧 개발 가이드

### 새로운 타입 추가

1. `src/types/` 디렉토리에 타입 정의 파일 생성
2. `src/utils/validation.ts`에 검증 함수 추가
3. `src/utils/constants.ts`에 관련 상수 추가
4. `src/index.ts`에서 export
5. 테스트 작성

### 검증 함수 작성 가이드

```typescript
// 타입 가드 함수 패턴
export function isValidCustomType(data: any): data is CustomType {
  return (
    typeof data === 'object' &&
    data !== null &&
    // 필수 필드 검증
    typeof data.requiredField === 'string' &&
    // 선택적 필드 검증
    (!data.optionalField || typeof data.optionalField === 'number') &&
    // 배열 필드 검증
    Array.isArray(data.arrayField) &&
    data.arrayField.every(item => typeof item === 'string')
  );
}
```

## 🛠️ 빌드 설정

### TypeScript 설정 (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

### 패키지 설정 (package.json)

```json
{
  "name": "@wallpaper-website/shared",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "clean": "rimraf dist"
  }
}
```

## 🔄 향후 개선 사항

- [ ] 런타임 스키마 검증 라이브러리 도입 (Zod, Yup)
- [ ] 더 세밀한 타입 정의 (브랜드 타입, 유니온 타입)
- [ ] 유틸리티 함수 확장 (날짜 처리, 문자열 처리)
- [ ] 국제화 지원을 위한 다국어 상수
- [ ] API 버전 관리를 위한 타입 네임스페이스
- [ ] 성능 최적화를 위한 타입 최적화