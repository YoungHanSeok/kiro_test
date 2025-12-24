import { Wallpaper, Theme, UserLike, SearchResult } from './wallpaper';

/**
 * API 응답 기본 인터페이스
 */
export interface ApiResponse<T = any> {
  /** 성공 여부 */
  success: boolean;
  /** 응답 데이터 */
  data?: T;
  /** 오류 메시지 */
  message?: string;
  /** 오류 코드 */
  errorCode?: string;
}

/**
 * 페이지네이션 파라미터
 */
export interface PaginationParams {
  /** 페이지 번호 (1부터 시작) */
  page?: number;
  /** 페이지 크기 */
  pageSize?: number;
}

/**
 * 검색 파라미터
 */
export interface SearchParams extends PaginationParams {
  /** 검색어 */
  query?: string;
  /** 테마 ID */
  themeId?: string;
  /** 태그 필터 */
  tags?: string[];
}

/**
 * 배경화면 API 응답 타입들
 */
export type WallpaperListResponse = ApiResponse<Wallpaper[]>;
export type WallpaperDetailResponse = ApiResponse<Wallpaper>;
export type SearchResponse = ApiResponse<SearchResult>;

/**
 * 테마 API 응답 타입들
 */
export type ThemeListResponse = ApiResponse<Theme[]>;
export type ThemeDetailResponse = ApiResponse<Theme>;

/**
 * 사용자 좋아요 API 응답 타입들
 */
export type UserLikesResponse = ApiResponse<UserLike[]>;
export type LikeActionResponse = ApiResponse<{ liked: boolean }>;

/**
 * 다운로드 요청 파라미터
 */
export interface DownloadParams {
  /** 배경화면 ID */
  wallpaperId: string;
  /** 요청 해상도 */
  resolution: string; // "1920x1080" 형식
}