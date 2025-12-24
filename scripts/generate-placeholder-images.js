#!/usr/bin/env node

/**
 * 플레이스홀더 이미지 생성 스크립트
 * 개발 환경에서 테스트용 이미지 파일들을 생성합니다.
 */

const fs = require('fs')
const path = require('path')

// 색상 출력을 위한 유틸리티
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

// SVG 플레이스홀더 이미지 생성 함수
function createPlaceholderSVG(width, height, text, bgColor = '#667eea') {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#grad)"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle" dy=".3em">
    ${text}
  </text>
  <text x="50%" y="60%" font-family="Arial, sans-serif" font-size="16" fill="rgba(255,255,255,0.8)" text-anchor="middle" dy=".3em">
    ${width} × ${height}
  </text>
</svg>`
}

// 썸네일 이미지 생성
function createThumbnailSVG(id, title) {
  return createPlaceholderSVG(300, 200, title, '#4a90e2')
}

// 배경화면 이미지 생성
function createWallpaperSVG(id, width, height, title) {
  return createPlaceholderSVG(width, height, title)
}

// 아이콘 SVG 생성
function createIconSVG(name, emoji) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="32" r="30" fill="#f8f9fa" stroke="#e9ecef" stroke-width="2"/>
  <text x="32" y="32" font-family="Arial, sans-serif" font-size="24" text-anchor="middle" dy=".3em">
    ${emoji}
  </text>
</svg>`
}

async function main() {
  log('🖼️  플레이스홀더 이미지 생성 시작', 'cyan')
  
  const baseDir = path.join(__dirname, '../packages/backend/uploads')
  
  // 디렉토리 생성
  const dirs = ['thumbnails', 'wallpapers', 'icons']
  dirs.forEach(dir => {
    const dirPath = path.join(baseDir, dir)
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }
  })
  
  // 테마 아이콘 생성 (이미 있으므로 스킵)
  log('✅ 테마 아이콘들이 이미 존재합니다', 'green')
  
  // 배경화면 데이터 로드
  const wallpapersPath = path.join(__dirname, '../packages/backend/src/data/wallpapers.json')
  const wallpapers = JSON.parse(fs.readFileSync(wallpapersPath, 'utf8'))
  
  let createdCount = 0
  
  // 각 배경화면에 대해 플레이스홀더 생성
  for (const wallpaper of wallpapers) {
    const { id, title } = wallpaper
    
    // 썸네일 생성
    const thumbnailPath = path.join(baseDir, 'thumbnails', `${id}-thumb.svg`)
    if (!fs.existsSync(thumbnailPath)) {
      const thumbnailSVG = createThumbnailSVG(id, title)
      fs.writeFileSync(thumbnailPath, thumbnailSVG)
      createdCount++
    }
    
    // 각 해상도별 배경화면 생성
    for (const resolution of wallpaper.resolutions) {
      const { width, height } = resolution
      const wallpaperPath = path.join(baseDir, 'wallpapers', `${id}-${width}x${height}.svg`)
      
      if (!fs.existsSync(wallpaperPath)) {
        const wallpaperSVG = createWallpaperSVG(id, width, height, title)
        fs.writeFileSync(wallpaperPath, wallpaperSVG)
        createdCount++
      }
    }
    
    // 원본 이미지 생성
    const originalPath = path.join(baseDir, 'wallpapers', `${id}-original.svg`)
    if (!fs.existsSync(originalPath)) {
      const originalSVG = createWallpaperSVG(id, 3840, 2160, `${title} (원본)`)
      fs.writeFileSync(originalPath, originalSVG)
      createdCount++
    }
  }
  
  log(`✅ ${createdCount}개의 플레이스홀더 이미지를 생성했습니다`, 'green')
  log('📝 참고: 실제 프로덕션에서는 .jpg 파일을 사용해야 합니다', 'yellow')
  log('🎉 플레이스홀더 이미지 생성 완료!', 'cyan')
}

// 스크립트 실행
if (require.main === module) {
  main().catch(console.error)
}

module.exports = { main }