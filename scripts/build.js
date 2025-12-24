#!/usr/bin/env node

/**
 * 프로덕션 빌드 스크립트
 * 모든 패키지를 순서대로 빌드합니다.
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🏗️  프로덕션 빌드를 시작합니다...\n');

// 환경 변수 설정
process.env.NODE_ENV = 'production';

async function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
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

async function build() {
  try {
    console.log('1️⃣  기존 빌드 파일 정리 중...');
    await runCommand('npm', ['run', 'clean']);
    
    console.log('\n2️⃣  공통 패키지 빌드 중...');
    await runCommand('npm', ['run', 'build', '--workspace=shared']);
    
    console.log('\n3️⃣  백엔드 빌드 중...');
    await runCommand('npm', ['run', 'build', '--workspace=packages/backend']);
    
    console.log('\n4️⃣  프론트엔드 빌드 중...');
    await runCommand('npm', ['run', 'build', '--workspace=packages/frontend']);
    
    console.log('\n✅ 프로덕션 빌드가 완료되었습니다!');
    console.log('\n📦 빌드된 파일 위치:');
    console.log('   - 백엔드: packages/backend/dist/');
    console.log('   - 프론트엔드: packages/frontend/dist/');
    console.log('   - 공통: shared/dist/');
    
  } catch (error) {
    console.error('\n❌ 빌드 중 오류가 발생했습니다:', error.message);
    process.exit(1);
  }
}

build();