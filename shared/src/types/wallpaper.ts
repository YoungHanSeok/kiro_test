/**
 * 해상도 정보 인터페이스
 */
export interface Resolution {
  /** 가로 해상도 */
  width: number;
  /** 세로 해상도 */
  height: number;
  /** 해당 해상도 파일 URL */
  fileUrl: string;
  /** 파일 크기 (bytes) */
  fileSize: number;
}

/**
 * 배경화면 인터페이스
 */
export interface Wallpaper {
  /** 고유 식별자 */
  id: string;
  /** 배경화면 제목 */
  title: string;
  /** 설명 */
  description?: string;
  /** 테마 ID */
  themeId: string;
  /** 검색용 태그 */
  tags: string[];
  /** 사용 가능한 해상도 목록 */
  resolutions: Resolution[];
  /** 썸네일 이미지 URL */
  thumbnailUrl: string;
  /** 원본 이미지 URL */
  originalUrl: string;
  /** 좋아요 수 */
  likeCount: number;
  /** 다운로드 수 */
  downloadCount: number;
  /** 생성일 */
  createdAt: Date;
  /** 수정일 */
  updatedAt: Date;
}

/**
 * 테마 인터페이스
 */
export interface Theme {
  /** 고유 식별자 */
  id: string;
  /** 테마 이름 */
  name: string;
  /** 테마 설명 */
  description: string;
  /** 테마 아이콘 URL */
  iconUrl?: string;
  /** 해당 테마의 배경화면 수 */
  wallpaperCount: number;
  /** 활성화 상태 */
  isActive: boolean;
  /** 정렬 순서 */
  sortOrder: number;
  /** 생성일 */
  createdAt: Date;
}

/**
 * 사용자 좋아요 인터페이스
 */
export interface UserLike {
  /** 고유 식별자 */
  id: string;
  /** 사용자 ID (세션 기반) */
  userId: string;
  /** 배경화면 ID */
  wallpaperId: string;
  /** 좋아요 표시 시간 */
  likedAt: Date;
}

/**
 * 검색 결과 인터페이스
 */
export interface SearchResult {
  /** 검색된 배경화면 목록 */
  wallpapers: Wallpaper[];
  /** 전체 결과 수 */
  totalCount: number;
  /** 현재 페이지 */
  page: number;
  /** 페이지 크기 */
  pageSize: number;
  /** 추가 결과 존재 여부 */
  hasMore: boolean;
}