#!/usr/bin/env node

/**
 * 배포 스크립트
 * 전체 프로젝트를 빌드하고 배포하는 통합 스크립트
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// 색상 출력을 위한 유틸리티
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function execCommand(command, description) {
  log(`\n🔄 ${description}...`, 'cyan')
  try {
    execSync(command, { stdio: 'inherit' })
    log(`✅ ${description} 완료!`, 'green')
  } catch (error) {
    log(`❌ ${description} 실패: ${error.message}`, 'red')
    process.exit(1)
  }
}

function checkRequirements() {
  log('📋 배포 요구사항 확인 중...', 'yellow')
  
  // Node.js 버전 확인
  const nodeVersion = process.version
  log(`Node.js 버전: ${nodeVersion}`, 'blue')
  
  // npm 버전 확인
  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim()
    log(`npm 버전: ${npmVersion}`, 'blue')
  } catch (error) {
    log('❌ npm이 설치되어 있지 않습니다.', 'red')
    process.exit(1)
  }
  
  // package.json 파일 존재 확인
  if (!fs.existsSync('package.json')) {
    log('❌ package.json 파일을 찾을 수 없습니다.', 'red')
    process.exit(1)
  }
  
  log('✅ 모든 요구사항이 충족되었습니다.', 'green')
}

function main() {
  log('🚀 배경화면 웹사이트 배포 시작', 'bright')
  
  // 요구사항 확인
  checkRequirements()
  
  // 의존성 설치
  execCommand('npm install', '의존성 설치')
  
  // 전체 프로젝트 빌드
  execCommand('npm run deploy:all', '전체 프로젝트 빌드')
  
  // 로그 디렉토리 생성
  if (!fs.existsSync('logs')) {
    fs.mkdirSync('logs')
    log('📁 로그 디렉토리 생성 완료', 'blue')
  }
  
  log('\n🎉 배포 준비 완료!', 'green')
  log('\n다음 명령어로 서버를 시작할 수 있습니다:', 'yellow')
  log('  • 개발 모드: npm run dev', 'cyan')
  log('  • 프로덕션 모드: npm run serve:prod', 'cyan')
  log('  • PM2로 시작: npm run pm2:start', 'cyan')
  log('  • Docker로 시작: npm run docker:up', 'cyan')
}

// 스크립트 실행
if (require.main === module) {
  main()
}

module.exports = { main, execCommand, log }