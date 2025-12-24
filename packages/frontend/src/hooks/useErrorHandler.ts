/**
 * 오류 처리 훅
 * 네트워크 오류 및 일반적인 오류를 처리하는 재사용 가능한 훅
 */

import { useState, useCallback } from 'react'
import { useAppContext } from '../context'

interface ErrorState {
  error: string | null
  isRetrying: boolean
}

interface UseErrorHandlerReturn {
  error: string | null
  isRetrying: boolean
  handleError: (error: any) => void
  clearError: () => void
  retry: (retryFn: () => Promise<void>) => Promise<void>
}

export function useErrorHandler(): UseErrorHandlerReturn {
  const { dispatch } = useAppContext()
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isRetrying: false
  })

  // 오류 처리 함수
  const handleError = useCallback((error: any) => {
    let errorMessage: string

    if (!error.response) {
      // 네트워크 오류
      errorMessage = '네트워크 연결을 확인해주세요'
    } else if (error.response.status === 404) {
      errorMessage = '요청한 리소스를 찾을 수 없습니다'
    } else if (error.response.status === 403) {
      errorMessage = '접근 권한이 없습니다'
    } else if (error.response.status >= 500) {
      errorMessage = '서버에 일시적인 문제가 발생했습니다'
    } else if (error.response.status === 429) {
      errorMessage = '요청이 너무 많습니다. 잠시 후 다시 시도해주세요'
    } else {
      errorMessage = error.response.data?.message || '알 수 없는 오류가 발생했습니다'
    }

    setErrorState({ error: errorMessage, isRetrying: false })
    
    // 전역 상태에도 오류 설정
    dispatch({ type: 'SET_ERROR', payload: errorMessage })

    // 개발 환경에서 콘솔에 상세 오류 출력
    if (process.env.NODE_ENV === 'development') {
      console.error('Error details:', error)
    }
  }, [dispatch])

  // 오류 초기화
  const clearError = useCallback(() => {
    setErrorState({ error: null, isRetrying: false })
    dispatch({ type: 'SET_ERROR', payload: null })
  }, [dispatch])

  // 재시도 함수
  const retry = useCallback(async (retryFn: () => Promise<void>) => {
    setErrorState(prev => ({ ...prev, isRetrying: true }))
    
    try {
      await retryFn()
      clearError()
    } catch (error) {
      handleError(error)
    } finally {
      setErrorState(prev => ({ ...prev, isRetrying: false }))
    }
  }, [handleError, clearError])

  return {
    error: errorState.error,
    isRetrying: errorState.isRetrying,
    handleError,
    clearError,
    retry
  }
}

// 특정 API 호출을 위한 오류 처리 훅
export function useApiCall<T>(
  apiCall: () => Promise<T>
): {
  data: T | null
  loading: boolean
  error: string | null
  isRetrying: boolean
  execute: () => Promise<void>
  retry: () => Promise<void>
  clearError: () => void
} {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const { error, isRetrying, handleError, clearError, retry } = useErrorHandler()

  const execute = useCallback(async () => {
    setLoading(true)
    clearError()
    
    try {
      const result = await apiCall()
      setData(result)
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }, [apiCall, handleError, clearError])

  const retryCall = useCallback(async () => {
    await retry(execute)
  }, [retry, execute])

  return {
    data,
    loading,
    error,
    isRetrying,
    execute,
    retry: retryCall,
    clearError
  }
}