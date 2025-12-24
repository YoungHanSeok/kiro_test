import { Wallpaper, Theme, Resolution, UserLike, SearchResult } from '../types/wallpaper';

/**
 * 배경화면 데이터 유효성 검증
 */
export function validateWallpaper(wallpaper: any): wallpaper is Wallpaper {
  return (
    typeof wallpaper === 'object' &&
    typeof wallpaper.id === 'string' &&
    wallpaper.id.length > 0 &&
    typeof wallpaper.title === 'string' &&
    wallpaper.title.length > 0 &&
    typeof wallpaper.themeId === 'string' &&
    wallpaper.themeId.length > 0 &&
    Array.isArray(wallpaper.resolutions) &&
    wallpaper.resolutions.length > 0 &&
    wallpaper.resolutions.every(validateResolution) &&
    Array.isArray(wallpaper.tags) &&
    typeof wallpaper.thumbnailUrl === 'string' &&
    typeof wallpaper.originalUrl === 'string' &&
    typeof wallpaper.likeCount === 'number' &&
    typeof wallpaper.downloadCount === 'number'
  );
}

/**
 * 해상도 데이터 유효성 검증
 */
export function validateResolution(resolution: any): resolution is Resolution {
  return (
    typeof resolution === 'object' &&
    typeof resolution.width === 'number' &&
    resolution.width > 0 &&
    typeof resolution.height === 'number' &&
    resolution.height > 0 &&
    typeof resolution.fileUrl === 'string' &&
    resolution.fileUrl.length > 0 &&
    typeof resolution.fileSize === 'number' &&
    resolution.fileSize > 0
  );
}

/**
 * 테마 데이터 유효성 검증
 */
export function validateTheme(theme: any): theme is Theme {
  return (
    typeof theme === 'object' &&
    typeof theme.id === 'string' &&
    theme.id.length > 0 &&
    typeof theme.name === 'string' &&
    theme.name.length > 0 &&
    typeof theme.description === 'string' &&
    typeof theme.wallpaperCount === 'number' &&
    theme.wallpaperCount >= 0 &&
    typeof theme.isActive === 'boolean' &&
    typeof theme.sortOrder === 'number'
  );
}

/**
 * 해상도 문자열 파싱 (예: "1920x1080")
 */
export function parseResolution(resolutionStr: string): { width: number; height: number } | null {
  const match = resolutionStr.match(/^(\d+)x(\d+)$/);
  if (!match) return null;
  
  const width = parseInt(match[1], 10);
  const height = parseInt(match[2], 10);
  
  if (width <= 0 || height <= 0) return null;
  
  return { width, height };
}

/**
 * 해상도를 문자열로 변환
 */
export function formatResolution(width: number, height: number): string {
  return `${width}x${height}`;
}

/**
 * 사용자 좋아요 데이터 유효성 검증
 */
export function validateUserLike(userLike: any): userLike is UserLike {
  return (
    typeof userLike === 'object' &&
    typeof userLike.id === 'string' &&
    userLike.id.length > 0 &&
    typeof userLike.userId === 'string' &&
    userLike.userId.length > 0 &&
    typeof userLike.wallpaperId === 'string' &&
    userLike.wallpaperId.length > 0 &&
    userLike.likedAt instanceof Date
  );
}

/**
 * 검색 결과 데이터 유효성 검증
 */
export function validateSearchResult(searchResult: any): searchResult is SearchResult {
  return (
    typeof searchResult === 'object' &&
    Array.isArray(searchResult.wallpapers) &&
    searchResult.wallpapers.every(validateWallpaper) &&
    typeof searchResult.totalCount === 'number' &&
    searchResult.totalCount >= 0 &&
    typeof searchResult.page === 'number' &&
    searchResult.page >= 1 &&
    typeof searchResult.pageSize === 'number' &&
    searchResult.pageSize > 0 &&
    typeof searchResult.hasMore === 'boolean'
  );
}

/**
 * 사용자 ID 유효성 검증 (세션 기반)
 */
export function validateUserId(userId: string): boolean {
  return typeof userId === 'string' && userId.length > 0 && userId.length <= 100;
}

/**
 * 검색어 유효성 검증
 */
export function validateSearchQuery(query: string): boolean {
  return typeof query === 'string' && query.trim().length > 0 && query.length <= 200;
}

/**
 * 페이지네이션 파라미터 유효성 검증
 */
export function validatePaginationParams(page: number, pageSize: number): boolean {
  return (
    typeof page === 'number' &&
    page >= 1 &&
    typeof pageSize === 'number' &&
    pageSize > 0 &&
    pageSize <= 100
  );
}

/**
 * 테마 ID 유효성 검증
 */
export function validateThemeId(themeId: string): boolean {
  return typeof themeId === 'string' && themeId.length > 0 && themeId.length <= 50;
}

/**
 * 배경화면 ID 유효성 검증
 */
export function validateWallpaperId(wallpaperId: string): boolean {
  return typeof wallpaperId === 'string' && wallpaperId.length > 0 && wallpaperId.length <= 50;
}