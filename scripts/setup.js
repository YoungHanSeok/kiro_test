#!/usr/bin/env node

/**
 * 프로젝트 초기 설정 스크립트
 * 의존성 설치 및 초기 빌드를 수행합니다.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 배경화면 웹사이트 프로젝트 설정을 시작합니다...\n');

async function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`실행 중: ${command} ${args.join(' ')}`);
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`명령어 실행 실패: ${command} ${args.join(' ')}`));
      }
    });
  });
}

function checkNodeVersion() {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (majorVersion < 18) {
    console.error('❌ Node.js 18 이상이 필요합니다. 현재 버전:', nodeVersion);
    process.exit(1);
  }
  
  console.log('✅ Node.js 버전 확인:', nodeVersion);
}

function createDirectories() {
  const dirs = [
    'packages/backend/uploads/wallpapers',
    'packages/backend/uploads/thumbnails',
    'packages/backend/uploads/icons',
    'packages/backend/logs'
  ];
  
  dirs.forEach(dir => {
    const fullPath = path.resolve(__dirname, '..', dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`📁 디렉토리 생성: ${dir}`);
    }
  });
}

async function setup() {
  try {
    console.log('1️⃣  Node.js 버전 확인 중...');
    checkNodeVersion();
    
    console.log('\n2️⃣  필요한 디렉토리 생성 중...');
    createDirectories();
    
    console.log('\n3️⃣  의존성 설치 중...');
    await runCommand('npm', ['install']);
    
    console.log('\n4️⃣  공통 패키지 빌드 중...');
    await runCommand('npm', ['run', 'build', '--workspace=shared']);
    
    console.log('\n✅ 프로젝트 설정이 완료되었습니다!');
    console.log('\n🚀 개발 서버를 시작하려면 다음 명령어를 실행하세요:');
    console.log('   npm run dev');
    console.log('\n📖 더 많은 명령어는 README.md를 참고하세요.');
    
  } catch (error) {
    console.error('\n❌ 설정 중 오류가 발생했습니다:', error.message);
    process.exit(1);
  }
}

setup();