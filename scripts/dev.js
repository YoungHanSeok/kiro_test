#!/usr/bin/env node

/**
 * 개발 환경 실행 스크립트
 * 모든 서비스를 동시에 실행하고 로그를 색상별로 구분하여 표시합니다.
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 배경화면 웹사이트 개발 환경을 시작합니다...\n');

// 환경 변수 설정
process.env.NODE_ENV = 'development';

// 개발 서버 실행
const devProcess = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  cwd: path.resolve(__dirname, '..')
});

// 프로세스 종료 처리
process.on('SIGINT', () => {
  console.log('\n🛑 개발 서버를 종료합니다...');
  devProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  devProcess.kill('SIGTERM');
  process.exit(0);
});

devProcess.on('close', (code) => {
  console.log(`\n개발 서버가 종료되었습니다. 종료 코드: ${code}`);
  process.exit(code);
});