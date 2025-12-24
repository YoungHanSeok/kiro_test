/**
 * 로딩 스피너 컴포넌트
 * API 요청 중 로딩 상태를 표시하는 재사용 가능한 컴포넌트
 */

import React from 'react'
import './LoadingSpinner.css'

interface LoadingSpinnerProps {
  /** 스피너 크기 */
  size?: 'small' | 'medium' | 'large'
  /** 로딩 메시지 */
  message?: string
  /** 인라인 표시 여부 */
  inline?: boolean
  /** 전체 화면 오버레이 여부 */
  overlay?: boolean
  /** 커스텀 클래스명 */
  className?: string
}

export function LoadingSpinner({
  size = 'medium',
  message,
  inline = false,
  overlay = false,
  className = ''
}: LoadingSpinnerProps) {
  const spinnerClasses = [
    'loading-spinner',
    `loading-spinner--${size}`,
    inline && 'loading-spinner--inline',
    overlay && 'loading-spinner--overlay',
    className
  ].filter(Boolean).join(' ')

  const content = (
    <div className={spinnerClasses}>
      <div className="loading-spinner__icon">
        <div className="spinner-circle"></div>
      </div>
      {message && (
        <div className="loading-spinner__message">
          {message}
        </div>
      )}
    </div>
  )

  if (overlay) {
    return (
      <div className="loading-spinner__backdrop">
        {content}
      </div>
    )
  }

  return content
}