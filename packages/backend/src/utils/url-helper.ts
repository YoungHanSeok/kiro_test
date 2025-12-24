/**
 * URL 헬퍼 유틸리티
 * 상대 경로를 절대 URL로 변환하는 기능을 제공합니다.
 */

/**
 * 서버 기본 URL 가져오기
 */
function getServerBaseUrl(): string {
  const port = process.env.PORT || 3001
  const host = process.env.HOST || 'localhost'
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  
  return `${protocol}://${host}:${port}`
}

/**
 * 상대 경로를 절대 URL로 변환
 * @param relativePath - 상대 경로 (예: "/uploads/icons/nature-icon.svg")
 * @returns 절대 URL (예: "http://localhost:3001/uploads/icons/nature-icon.svg")
 */
export function toAbsoluteUrl(relativePath: string): string {
  if (!relativePath) return ''
  
  // 이미 절대 URL인 경우 그대로 반환
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath
  }
  
  const baseUrl = getServerBaseUrl()
  
  // 상대 경로가 /로 시작하지 않으면 추가
  const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`
  
  return `${baseUrl}${path}`
}

/**
 * 테마 객체의 아이콘 URL을 절대 경로로 변환
 */
export function transformThemeUrls<T extends { iconUrl?: string }>(theme: T): T {
  return {
    ...theme,
    iconUrl: theme.iconUrl ? toAbsoluteUrl(theme.iconUrl) : theme.iconUrl
  }
}

/**
 * 배경화면 객체의 URL들을 절대 경로로 변환
 */
export function transformWallpaperUrls<T extends { 
  thumbnailUrl?: string
  imageUrl?: string 
  [key: string]: any 
}>(wallpaper: T): T {
  return {
    ...wallpaper,
    thumbnailUrl: wallpaper.thumbnailUrl ? toAbsoluteUrl(wallpaper.thumbnailUrl) : wallpaper.thumbnailUrl,
    imageUrl: wallpaper.imageUrl ? toAbsoluteUrl(wallpaper.imageUrl) : wallpaper.imageUrl
  }
}