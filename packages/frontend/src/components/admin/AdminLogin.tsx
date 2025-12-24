/**
 * 관리자 로그인 컴포넌트
 */

import React, { useState } from 'react'
import { useAppContext } from '../../context'
import { checkAdminStatus } from '../../api'
import './AdminLogin.css'

interface AdminLoginProps {
  onClose: () => void
}

export function AdminLogin({ onClose }: AdminLoginProps) {
  const { dispatch } = useAppContext()
  const [adminKey, setAdminKey] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!adminKey.trim()) {
      setError('관리자 키를 입력해주세요')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await checkAdminStatus(adminKey.trim())
      
      if (result.isAdmin) {
        dispatch({ type: 'SET_ADMIN_KEY', payload: adminKey.trim() })
        dispatch({ type: 'SET_ADMIN_STATUS', payload: true })
        onClose()
      } else {
        setError('유효하지 않은 관리자 키입니다')
      }
    } catch (error) {
      console.error('관리자 인증 오류:', error)
      setError('인증 중 오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    dispatch({ type: 'SET_ADMIN_KEY', payload: null })
    dispatch({ type: 'SET_ADMIN_STATUS', payload: false })
    onClose()
  }

  return (
    <div className="admin-login-overlay">
      <div className="admin-login-modal">
        <div className="admin-login-header">
          <h2>관리자 로그인</h2>
          <button 
            className="close-button"
            onClick={onClose}
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="adminKey">관리자 키</label>
            <input
              id="adminKey"
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="관리자 키를 입력하세요"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-actions">
            <button
              type="submit"
              disabled={isLoading}
              className="login-button"
            >
              {isLoading ? '인증 중...' : '로그인'}
            </button>
            
            <button
              type="button"
              onClick={handleLogout}
              className="logout-button"
            >
              로그아웃
            </button>
          </div>
        </form>

        <div className="admin-info">
          <p>관리자만 배경화면을 업로드하고 관리할 수 있습니다.</p>
        </div>
      </div>
    </div>
  )
}