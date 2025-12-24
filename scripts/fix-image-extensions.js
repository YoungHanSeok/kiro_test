#!/usr/bin/env node

/**
 * 이미지 파일 확장자 수정 스크립트
 * 배경화면 데이터의 .jpg 확장자를 .svg로 변경합니다.
 */

const fs = require('fs')
const path = require('path')

function main() {
  console.log('🔧 이미지 파일 확장자 수정 시작...')
  
  const wallpapersPath = path.join(__dirname, '../packages/backend/src/data/wallpapers.json')
  
  // 파일 읽기
  const data = fs.readFileSync(wallpapersPath, 'utf8')
  
  // .jpg를 .svg로 변경
  const updatedData = data.replace(/\.jpg/g, '.svg')
  
  // 파일 쓰기
  fs.writeFileSync(wallpapersPath, updatedData)
  
  console.log('✅ 이미지 파일 확장자를 .jpg에서 .svg로 변경했습니다')
  console.log('📝 개발 환경에서 SVG 플레이스홀더를 사용합니다')
}

if (require.main === module) {
  main()
}

module.exports = { main }