import '@testing-library/jest-dom'
import { vi } from 'vitest'

// 전역 테스트 설정
beforeAll(() => {
  // 테스트 시작 전 설정
})

afterAll(() => {
  // 테스트 종료 후 정리
})

beforeEach(() => {
  // 각 테스트 전 설정
})

afterEach(() => {
  // 각 테스트 후 정리
  vi.clearAllMocks()
})