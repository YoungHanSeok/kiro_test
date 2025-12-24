/**
 * 프론트엔드 애플리케이션 진입점
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { AppProvider } from './context'
import { AppRouter } from './router'
import { ErrorBoundary } from './components/ui'
import { AdSenseScript } from './components/ads'

function App() {
  return (
    <HelmetProvider>
      <ErrorBoundary
        onError={(error, errorInfo) => {
          // 프로덕션 환경에서는 오류 로깅 서비스로 전송
          console.error('Application Error:', error, errorInfo)
        }}
      >
        <AdSenseScript />
        <AppProvider>
          <AppRouter />
        </AppProvider>
      </ErrorBoundary>
    </HelmetProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)