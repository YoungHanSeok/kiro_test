/**
 * Jest 테스트 설정 파일
 * 모든 테스트 실행 전에 로드됩니다.
 */

// 테스트 환경 변수 설정
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';

// 전역 테스트 설정
beforeAll(() => {
  // 테스트 시작 전 설정
});

afterAll(() => {
  // 테스트 종료 후 정리
});

beforeEach(() => {
  // 각 테스트 전 설정
});

afterEach(() => {
  // 각 테스트 후 정리
});