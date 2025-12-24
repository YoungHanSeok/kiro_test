/**
 * 네트워크 오류 컴포넌트
 * 네트워크 오류 시 재시도 버튼과 함께 오류 메시지를 표시
 */

import React from 'react'
import './NetworkError.css'

interface NetworkErrorProps {
  /** 오류 메시지 */
  message?: string
  /** 재시도 버튼 클릭 핸들러 */
  onRetry?: () => void
  /** 재시도 중 상태 */
  retrying?: boolean
  /** 컴팩트 모드 (작은 크기로 표시) */
  compact?: boolean
  /** 커스텀 클래스명 */
  className?: string
}

export function NetworkError({
  message = '네트워크 연결을 확인해주세요',
  onRetry,
  retrying = false,
  compact = false,
  className = ''
}: NetworkErrorProps) {
  const containerClasses = [
    'network-error',
    compact && 'network-error--compact',
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={containerClasses}>
      <div className="network-error__content">
        <div className="network-error__icon">
          {compact ? '⚠️' : '🌐'}
        </div>
        
        <div className="network-error__text">
          <h3 className="network-error__title">
            {compact ? '연결 오류' : '네트워크 오류'}
          </h3>
          <p className="network-error__message">
            {message}
          </p>
        </div>

        {onRetry && (
          <button
            className="network-error__retry-button"
            onClick={onRetry}
            disabled={retrying}
          >
            {retrying ? (
              <>
                <span className="retry-spinner">⟳</span>
                재시도 중...
              </>
            ) : (
              <>
                <span className="retry-icon">🔄</span>
                다시 시도
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

// 인라인 네트워크 오류 컴포넌트
interface InlineNetworkErrorProps {
  /** 오류 메시지 */
  message?: string
  /** 재시도 버튼 클릭 핸들러 */
  onRetry?: () => void
  /** 재시도 중 상태 */
  retrying?: boolean
}

export function InlineNetworkError({
  message = '데이터를 불러올 수 없습니다',
  onRetry,
  retrying = false
}: InlineNetworkErrorProps) {
  return (
    <div className="inline-network-error">
      <span className="inline-network-error__icon">⚠️</span>
      <span className="inline-network-error__message">{message}</span>
      {onRetry && (
        <button
          className="inline-network-error__retry"
          onClick={onRetry}
          disabled={retrying}
        >
          {retrying ? '⟳' : '재시도'}
        </button>
      )}
    </div>
  )
}