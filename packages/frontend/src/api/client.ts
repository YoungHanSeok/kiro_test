/**
 * API 클라이언트 설정
 */

import axios from 'axios'

// API 기본 URL 설정
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// Axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 요청 인터셉터 - 요청 로깅
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API 요청: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('API 요청 오류:', error)
    return Promise.reject(error)
  }
)

// 재시도 설정
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1초

// 재시도 가능한 오류인지 확인
const isRetryableError = (error: any): boolean => {
  // 네트워크 오류 또는 5xx 서버 오류인 경우 재시도
  return !error.response || (error.response.status >= 500)
}

// 지연 함수
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// 응답 인터셉터 - 오류 처리 및 재시도
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API 응답: ${response.status} ${response.config.url}`)
    return response
  },
  async (error) => {
    const config = error.config
    
    console.error('API 응답 오류:', error.response?.status, error.message)
    
    // 재시도 로직
    if (isRetryableError(error) && config && !config._retry) {
      config._retryCount = config._retryCount || 0
      
      if (config._retryCount < MAX_RETRIES) {
        config._retryCount++
        console.log(`API 재시도 ${config._retryCount}/${MAX_RETRIES}: ${config.url}`)
        
        // 지연 후 재시도
        await delay(RETRY_DELAY * config._retryCount)
        return apiClient(config)
      }
    }
    
    // 공통 오류 처리
    if (error.response?.status === 404) {
      console.error('리소스를 찾을 수 없습니다')
    } else if (error.response?.status >= 500) {
      console.error('서버 오류가 발생했습니다')
    } else if (!error.response) {
      console.error('네트워크 연결 오류가 발생했습니다')
    }
    
    return Promise.reject(error)
  }
)