/**
 * 관리자 패널 컴포넌트
 * 관리자 로그인, 배경화면 업로드, 관리 기능을 제공합니다.
 */

import React, { useState, useEffect } from 'react'
import { useAppContext } from '../../context'
import { checkAdminStatus, wallpaperApi, themeApi } from '../../api'
import { AdminLogin } from './AdminLogin'
import { WallpaperUpload } from './WallpaperUpload'
import './AdminPanel.css'

export function AdminPanel() {
  const { state, dispatch } = useAppContext()
  const [showLogin, setShowLogin] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(false)
  const [clickCount, setClickCount] = useState(0)
  const [clickTimer, setClickTimer] = useState<NodeJS.Timeout | null>(null)

  // 컴포넌트 마운트 시 저장된 관리자 키로 인증 상태 확인
  useEffect(() => {
    const checkSavedAuth = async () => {
      if (state.adminKey && !state.isAdmin) {
        setIsCheckingAuth(true)
        try {
          const result = await checkAdminStatus(state.adminKey)
          dispatch({ type: 'SET_ADMIN_STATUS', payload: result.isAdmin })
        } catch (error) {
          console.error('저장된 관리자 키 확인 실패:', error)
          // 유효하지 않은 키는 제거
          dispatch({ type: 'SET_ADMIN_KEY', payload: null })
        } finally {
          setIsCheckingAuth(false)
        }
      }
    }

    checkSavedAuth()
  }, [state.adminKey, state.isAdmin, dispatch])

  // 비밀 클릭 핸들러
  const handleSecretClick = () => {
    setClickCount(prev => prev + 1)
    
    // 기존 타이머가 있으면 클리어
    if (clickTimer) {
      clearTimeout(clickTimer)
    }
    
    // 5번 클릭하면 로그인 모달 표시
    if (clickCount + 1 >= 5) {
      setShowLogin(true)
      setClickCount(0)
      setClickTimer(null)
      return
    }
    
    // 2초 후 클릭 카운트 리셋
    const timer = setTimeout(() => {
      setClickCount(0)
      setClickTimer(null)
    }, 2000)
    
    setClickTimer(timer)
  }

  const handleLoginSuccess = () => {
    setShowLogin(false)
  }

  const handleUploadSuccess = () => {
    // 배경화면 목록 새로고침
    wallpaperApi.getAll()
      .then(wallpapers => {
        dispatch({ type: 'SET_WALLPAPERS', payload: wallpapers })
      })
      .catch(error => {
        console.error('배경화면 목록 새로고침 실패:', error)
      })
    
    // 테마 목록도 새로고침하여 개수 업데이트
    themeApi.getAll()
      .then(themes => {
        dispatch({ type: 'SET_THEMES', payload: themes })
      })
      .catch(error => {
        console.error('테마 목록 새로고침 실패:', error)
      })
  }

  const handleLogout = () => {
    dispatch({ type: 'SET_ADMIN_KEY', payload: null })
    dispatch({ type: 'SET_ADMIN_STATUS', payload: false })
  }

  if (isCheckingAuth) {
    return null // 인증 확인 중에는 아무것도 표시하지 않음
  }

  return (
    <div className="admin-panel">
      {/* 비밀 클릭 영역 - 사이트 제목 부분 */}
      <div 
        className="admin-secret-area"
        onClick={handleSecretClick}
        style={{ 
          position: 'fixed', 
          top: '10px', 
          right: '10px', 
          width: '50px', 
          height: '50px', 
          cursor: 'default',
          zIndex: 1000,
          backgroundColor: 'transparent'
        }}
      />
      
      {/* 관리자가 로그인된 경우에만 컨트롤 표시 */}
      {state.isAdmin && (
        <div className="admin-controls">
          <button 
            className="admin-button upload-button"
            onClick={() => setShowUpload(true)}
          >
            배경화면 업로드
          </button>
          <button 
            className="admin-button logout-button"
            onClick={handleLogout}
          >
            로그아웃
          </button>
        </div>
      )}

      {/* 관리자 로그인 모달 */}
      {showLogin && (
        <AdminLogin 
          onClose={() => setShowLogin(false)}
        />
      )}

      {/* 배경화면 업로드 모달 */}
      {showUpload && state.isAdmin && (
        <WallpaperUpload 
          onClose={() => setShowUpload(false)}
          onSuccess={handleUploadSuccess}
        />
      )}
    </div>
  )
}