# 🎨 프론트엔드 애플리케이션

React 18과 TypeScript로 구축된 현대적인 웹 애플리케이션으로, 사용자가 배경화면을 탐색하고 다운로드할 수 있는 직관적인 인터페이스를 제공합니다.

## 📋 주요 기능

- 🖼️ **배경화면 그리드**: 반응형 그리드 레이아웃으로 배경화면 표시
- 🎨 **테마 선택**: 다양한 테마별 배경화면 필터링
- 🔍 **실시간 검색**: 키워드 기반 실시간 검색 기능
- ❤️ **좋아요 시스템**: 마음에 드는 배경화면 저장 및 관리
- ⬇️ **다운로드 모달**: 해상도 선택 및 다운로드 진행 상태 표시
- 📱 **반응형 디자인**: 모바일, 태블릿, 데스크톱 최적화
- ⚡ **성능 최적화**: 이미지 지연 로딩 및 스켈레톤 UI

## 🏗️ 프로젝트 구조

```
src/
├── components/          # UI 컴포넌트
│   ├── layout/         # 레이아웃 컴포넌트
│   └── ui/             # 재사용 가능한 UI 컴포넌트
│       ├── WallpaperGrid.tsx
│       ├── WallpaperCard.tsx
│       ├── ThemeSelector.tsx
│       ├── SearchBar.tsx
│       ├── DownloadModal.tsx
│       └── ...
├── pages/              # 페이지 컴포넌트
│   ├── HomePage.tsx
│   ├── ThemePage.tsx
│   ├── WallpaperDetailPage.tsx
│   └── FavoritesPage.tsx
├── api/                # API 클라이언트
│   ├── client.ts
│   ├── wallpapers.ts
│   ├── themes.ts
│   └── users.ts
├── hooks/              # 커스텀 훅
│   ├── useErrorHandler.ts
│   ├── useResponsive.ts
│   └── useTouch.ts
├── context/            # 상태 관리
│   └── AppContext.tsx
├── router/             # 라우팅 설정
├── utils/              # 유틸리티 함수
└── main.tsx           # 애플리케이션 진입점
```

## 🚀 개발 환경 설정

### 의존성 설치

```bash
# 루트에서 실행
npm install

# 또는 프론트엔드만 설치
npm install --workspace=packages/frontend
```

### 개발 서버 실행

```bash
# 프론트엔드만 실행
npm run dev:frontend

# 또는 프론트엔드 디렉토리에서
cd packages/frontend
npm run dev
```

애플리케이션은 http://localhost:5173에서 실행됩니다.

## 🎯 주요 컴포넌트

### 페이지 컴포넌트

#### HomePage
- 메인 페이지로 테마 선택기와 인기 배경화면 표시
- 검색 기능 통합
- 반응형 그리드 레이아웃

#### ThemePage
- 특정 테마의 배경화면 목록 표시
- 필터링 및 정렬 기능
- 무한 스크롤 또는 페이지네이션

#### WallpaperDetailPage
- 배경화면 상세 정보 및 큰 이미지 표시
- 다운로드 모달 통합
- 좋아요 기능 통합

#### FavoritesPage
- 사용자 좋아요 목록 표시
- 좋아요 제거 기능

### UI 컴포넌트

#### WallpaperGrid
```tsx
interface WallpaperGridProps {
  wallpapers: Wallpaper[];
  loading?: boolean;
  onWallpaperClick?: (wallpaper: Wallpaper) => void;
}
```

#### WallpaperCard
```tsx
interface WallpaperCardProps {
  wallpaper: Wallpaper;
  isLiked?: boolean;
  onLike?: (wallpaperId: string) => void;
  onDownload?: (wallpaper: Wallpaper) => void;
}
```

#### ThemeSelector
```tsx
interface ThemeSelectorProps {
  themes: Theme[];
  selectedTheme?: string;
  onThemeSelect: (themeId: string) => void;
}
```

#### SearchBar
```tsx
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
}
```

#### DownloadModal
```tsx
interface DownloadModalProps {
  wallpaper: Wallpaper;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (wallpaperId: string, resolution: string) => void;
}
```

## 🔧 API 클라이언트

### 기본 설정

```typescript
// src/api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 10000,
});
```

### API 함수들

```typescript
// 배경화면 API
export const getWallpapers = () => apiClient.get('/wallpapers');
export const getWallpaper = (id: string) => apiClient.get(`/wallpapers/${id}`);
export const getWallpapersByTheme = (theme: string) => 
  apiClient.get(`/wallpapers/theme/${theme}`);
export const searchWallpapers = (query: string) => 
  apiClient.get(`/wallpapers/search?q=${query}`);

// 테마 API
export const getThemes = () => apiClient.get('/themes');
export const getTheme = (id: string) => apiClient.get(`/themes/${id}`);

// 사용자 좋아요 API
export const getUserLikes = (userId: string) => 
  apiClient.get(`/users/${userId}/likes`);
export const addLike = (userId: string, wallpaperId: string) => 
  apiClient.post(`/users/${userId}/likes`, { wallpaperId });
export const removeLike = (userId: string, wallpaperId: string) => 
  apiClient.delete(`/users/${userId}/likes/${wallpaperId}`);
```

## 🎨 스타일링

### CSS 모듈 사용

각 컴포넌트는 해당하는 CSS 파일을 가집니다:

```
WallpaperCard.tsx
WallpaperCard.css
```

### 반응형 디자인

```css
/* 모바일 우선 접근법 */
.wallpaper-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

/* 태블릿 */
@media (min-width: 768px) {
  .wallpaper-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 데스크톱 */
@media (min-width: 1024px) {
  .wallpaper-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* 대형 화면 */
@media (min-width: 1440px) {
  .wallpaper-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
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

# E2E 테스트
npm run test:e2e

# E2E 테스트 (UI 모드)
npm run test:e2e:ui
```

### 테스트 구조

```
src/
├── components/
│   └── ui/
│       ├── SearchBar.test.tsx        # 단위 테스트
│       └── WallpaperCard.test.tsx
├── e2e/                              # E2E 테스트
│   ├── wallpaper-flow.spec.ts
│   └── search-flow.spec.ts
└── test/
    └── setup.ts                      # 테스트 설정
```

### 단위 테스트 예제

```typescript
// SearchBar.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchBar } from './SearchBar';

describe('SearchBar', () => {
  it('검색어 입력 시 onChange 콜백이 호출된다', () => {
    const mockOnChange = jest.fn();
    render(<SearchBar value="" onChange={mockOnChange} onClear={() => {}} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '자연' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('자연');
  });
});
```

### E2E 테스트 예제

```typescript
// wallpaper-flow.spec.ts
import { test, expect } from '@playwright/test';

test('배경화면 탐색 및 다운로드 플로우', async ({ page }) => {
  await page.goto('/');
  
  // 테마 선택
  await page.click('[data-testid="theme-nature"]');
  
  // 배경화면 클릭
  await page.click('[data-testid="wallpaper-card"]:first-child');
  
  // 다운로드 모달 열기
  await page.click('[data-testid="download-button"]');
  
  // 해상도 선택 및 다운로드
  await page.click('[data-testid="resolution-1920x1080"]');
  
  // 다운로드 시작 확인
  await expect(page.locator('[data-testid="download-progress"]')).toBeVisible();
});
```

## 🔄 상태 관리

### Context API 사용

```typescript
// AppContext.tsx
interface AppContextType {
  user: User | null;
  likedWallpapers: string[];
  addLike: (wallpaperId: string) => void;
  removeLike: (wallpaperId: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);
```

### 커스텀 훅

```typescript
// useErrorHandler.ts
export const useErrorHandler = () => {
  const [error, setError] = useState<string | null>(null);
  
  const handleError = useCallback((error: Error) => {
    console.error('Error:', error);
    setError(error.message);
  }, []);
  
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  return { error, handleError, clearError };
};
```

## 🎯 성능 최적화

### 이미지 지연 로딩

```typescript
// LazyImage.tsx
const LazyImage: React.FC<LazyImageProps> = ({ src, alt, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  return (
    <div ref={imgRef} className="lazy-image-container">
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          className={isLoaded ? 'loaded' : 'loading'}
          {...props}
        />
      )}
    </div>
  );
};
```

### 메모이제이션

```typescript
// WallpaperGrid.tsx
const WallpaperGrid = memo<WallpaperGridProps>(({ wallpapers, onWallpaperClick }) => {
  const memoizedWallpapers = useMemo(() => 
    wallpapers.map(wallpaper => (
      <WallpaperCard
        key={wallpaper.id}
        wallpaper={wallpaper}
        onClick={() => onWallpaperClick?.(wallpaper)}
      />
    )), [wallpapers, onWallpaperClick]
  );
  
  return <div className="wallpaper-grid">{memoizedWallpapers}</div>;
});
```

## 🛠️ 빌드 및 배포

### 개발 빌드

```bash
npm run build
```

### 프로덕션 빌드

```bash
npm run build:prod
```

### 프리뷰 서버

```bash
npm run preview
```

### 환경 변수

```bash
# .env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_TITLE=배경화면 다운로드 사이트
```

## 🐛 문제 해결

### 개발 서버 시작 오류

```bash
# 포트 충돌 확인
netstat -ano | findstr :5173

# 캐시 정리
rm -rf node_modules/.vite
npm run dev
```

### 빌드 오류

```bash
# 타입 체크
npx tsc --noEmit

# 의존성 확인
npm ls
```

### API 연결 오류

```bash
# 백엔드 서버 상태 확인
curl http://localhost:3001/api/wallpapers

# CORS 설정 확인
```

## 📱 반응형 디자인

### 브레이크포인트

```css
/* 모바일 */
@media (max-width: 767px) { }

/* 태블릿 */
@media (min-width: 768px) and (max-width: 1023px) { }

/* 데스크톱 */
@media (min-width: 1024px) { }

/* 대형 화면 */
@media (min-width: 1440px) { }
```

### 터치 제스처

```typescript
// useTouch.ts
export const useTouch = () => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const onTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    return { isLeftSwipe, isRightSwipe };
  };
  
  return { onTouchStart, onTouchMove, onTouchEnd };
};
```

## 🔄 향후 개선 사항

- [ ] PWA (Progressive Web App) 지원
- [ ] 다크 모드 테마
- [ ] 무한 스크롤 최적화
- [ ] 이미지 캐싱 개선
- [ ] 오프라인 지원
- [ ] 접근성 개선 (ARIA 라벨, 키보드 네비게이션)
- [ ] 다국어 지원 (i18n)
- [ ] 애니메이션 및 트랜지션 개선