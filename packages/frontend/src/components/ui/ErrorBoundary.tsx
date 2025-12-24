/**
 * 오류 경계 컴포넌트
 * React 애플리케이션에서 발생하는 JavaScript 오류를 포착하고 대체 UI를 표시
 */

import React, { Component, ReactNode } from 'react'
import './ErrorBoundary.css'

interface ErrorBoundaryProps {
  /** 자식 컴포넌트 */
  children: ReactNode
  /** 오류 발생 시 표시할 대체 UI */
  fallback?: ReactNode
  /** 오류 발생 시 호출되는 콜백 */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // 다음 렌더링에서 대체 UI를 표시하도록 상태를 업데이트
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 오류 로깅
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // 부모 컴포넌트에 오류 알림
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      // 커스텀 대체 UI가 제공된 경우
      if (this.props.fallback) {
        return this.props.fallback
      }

      // 기본 오류 UI
      return (
        <div className="error-boundary">
          <div className="error-boundary__content">
            <div className="error-boundary__icon">⚠️</div>
            <h2 className="error-boundary__title">문제가 발생했습니다</h2>
            <p className="error-boundary__message">
              예상치 못한 오류가 발생했습니다. 페이지를 새로고침하거나 잠시 후 다시 시도해주세요.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-boundary__details">
                <summary>오류 세부 정보</summary>
                <pre className="error-boundary__stack">
                  {this.state.error.toString()}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            <div className="error-boundary__actions">
              <button 
                className="error-boundary__button error-boundary__button--primary"
                onClick={this.handleRetry}
              >
                다시 시도
              </button>
              <button 
                className="error-boundary__button error-boundary__button--secondary"
                onClick={() => window.location.reload()}
              >
                페이지 새로고침
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// 함수형 컴포넌트용 HOC
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}