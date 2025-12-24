/**
 * API 엔드포인트 상수
 */
export const API_ENDPOINTS = {
  // 배경화면 관련
  WALLPAPERS: '/api/wallpapers',
  WALLPAPER_BY_ID: (id: string) => `/api/wallpapers/${id}`,
  WALLPAPERS_BY_THEME: (themeId: string) => `/api/wallpapers/theme/${themeId}`,
  WALLPAPERS_SEARCH: '/api/wallpapers/search',
  
  // 테마 관련
  THEMES: '/api/themes',
  THEME_BY_ID: (id: string) => `/api/themes/${id}`,
  
  // 사용자 좋아요 관련
  USER_LIKES: (userId: string) => `/api/users/${userId}/likes`,
  ADD_LIKE: (userId: string) => `/api/users/${userId}/likes`,
  REMOVE_LIKE: (userId: string, wallpaperId: string) => `/api/users/${userId}/likes/${wallpaperId}`,
  
  // 파일 다운로드
  DOWNLOAD: (id: string, resolution: string) => `/api/download/${id}/${resolution}`,
} as const;

/**
 * HTTP 상태 코드
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * 기본 페이지네이션 설정
 */
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

/**
 * 지원되는 이미지 형식
 */
export const SUPPORTED_IMAGE_FORMATS = [
  'jpg',
  'jpeg',
  'png',
  'webp',
] as const;

/**
 * 일반적인 해상도 목록
 */
export const COMMON_RESOLUTIONS = [
  { width: 1920, height: 1080, label: 'Full HD' },
  { width: 2560, height: 1440, label: '2K QHD' },
  { width: 3840, height: 2160, label: '4K UHD' },
  { width: 1366, height: 768, label: 'HD' },
  { width: 1280, height: 720, label: 'HD 720p' },
] as const;