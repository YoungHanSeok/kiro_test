/**
 * 배경화면 카드 컴포넌트
 * 배경화면 썸네일, 제목, 좋아요 버튼을 표시하고 클릭 시 상세 페이지로 이동
 */

import React, { useState } from 'react'
import './WallpaperCard.css'
import { useNavigate } from 'react-router-dom'
import type { Wallpaper } from '@wallpaper-website/shared'
import { useAppContext } from '../../context'
import { userApi, deleteWallpaper } from '../../api'
import { LazyImage } from './LazyImage'
import { useIsTouchDevice, useLongPress } from '../../hooks'

interface WallpaperCardProps {
  /** 표시할 배경화면 데이터 */
  wallpaper: Wallpaper
  /** 카드 클릭 시 호출되는 콜백 (선택사항) */
  onClick?: (wallpaper: Wallpaper) => void
  /** 삭제 성공 시 호출되는 콜백 (선택사항) */
  onDelete?: () => void
}

export function WallpaperCard({ wallpaper, onClick, onDelete }: WallpaperCardProps) {
  const navigate = useNavigate()
  const { state, dispatch } = useAppContext()
  const [isLikeLoading, setIsLikeLoading] = useState(false)
  const [isDeleteLoading, setIsDeleteLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const isTouchDevice = useIsTouchDevice()

  // 현재 배경화면이 좋아요 상태인지 확인
  const isLiked = state.likedWallpapers.includes(wallpaper.id)

  // 카드 클릭 핸들러
  const handleCardClick = () => {
    if (onClick) {
      onClick(wallpaper)
    } else {
      // 기본 동작: 상세 페이지로 이동
      navigate(`/wallpaper/${wallpaper.id}`)
    }
  }

  // 좋아요 버튼 클릭 핸들러
  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation() // 카드 클릭 이벤트 전파 방지
    
    if (isLikeLoading) return

    setIsLikeLoading(true)
    
    try {
      if (isLiked) {
        // 좋아요 제거
        await userApi.removeLike(state.userId, wallpaper.id)
        dispatch({ type: 'REMOVE_LIKE', payload: wallpaper.id })
      } else {
        // 좋아요 추가
        await userApi.addLike(state.userId, wallpaper.id)
        dispatch({ type: 'ADD_LIKE', payload: wallpaper.id })
      }
    } catch (error) {
      console.error('좋아요 처리 중 오류 발생:', error)
      dispatch({ 
        type: 'SET_ERROR', 
        payload: '좋아요 처리 중 오류가 발생했습니다.' 
      })
    } finally {
      setIsLikeLoading(false)
    }
  }

  // 삭제 버튼 클릭 핸들러 (관리자 전용)
  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation() // 카드 클릭 이벤트 전파 방지
    
    if (isDeleteLoading || !state.adminKey) return

    const confirmed = window.confirm(`"${wallpaper.title}" 배경화면을 삭제하시겠습니까?`)
    if (!confirmed) return

    setIsDeleteLoading(true)
    
    try {
      await deleteWallpaper(state.adminKey, wallpaper.id)
      
      // 성공 시 콜백 호출
      if (onDelete) {
        onDelete()
      }
      
      dispatch({ 
        type: 'SET_ERROR', 
        payload: null 
      })
    } catch (error) {
      console.error('배경화면 삭제 중 오류 발생:', error)
      dispatch({ 
        type: 'SET_ERROR', 
        payload: '배경화면 삭제 중 오류가 발생했습니다.' 
      })
    } finally {
      setIsDeleteLoading(false)
    }
  }

  // 이미지 로딩 완료 핸들러
  const handleImageLoad = () => {
    // 이미지 로딩 완료 시 추가 작업이 필요하면 여기에 구현
  }

  // 이미지 로딩 오류 핸들러
  const handleImageError = () => {
    console.warn(`배경화면 이미지 로딩 실패: ${wallpaper.id}`)
  }

  // 길게 누르기 제스처 (터치 디바이스에서 미리보기)
  const longPressHandlers = useLongPress(
    () => {
      if (isTouchDevice) {
        setShowPreview(true)
      }
    },
    {
      threshold: 500,
      onFinish: () => setShowPreview(false),
      onCancel: () => setShowPreview(false)
    }
  )

  return (
    <div 
      className={`wallpaper-card ${showPreview ? 'wallpaper-card--preview' : ''}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleCardClick()
        }
      }}
      {...(isTouchDevice ? longPressHandlers : {})}
    >
      {/* 썸네일 이미지 */}
      <div className="wallpaper-card__image-container">
        <LazyImage
          src={wallpaper.thumbnailUrl}
          alt={wallpaper.title}
          className="wallpaper-card__image"
          skeletonHeight="100%"
          onLoad={handleImageLoad}
          onError={handleImageError}
          lazy={true}
        />
        
        {/* 좋아요 버튼 */}
        <button
          className={`wallpaper-card__like-button ${isLiked ? 'liked' : ''}`}
          onClick={handleLikeClick}
          disabled={isLikeLoading}
          aria-label={isLiked ? '좋아요 취소' : '좋아요'}
        >
          {isLikeLoading ? (
            <span className="loading-spinner">⟳</span>
          ) : (
            <span className="heart-icon">{isLiked ? '❤️' : '🤍'}</span>
          )}
        </button>

        {/* 삭제 버튼 (관리자 전용) */}
        {state.isAdmin && (
          <button
            className="wallpaper-card__delete-button"
            onClick={handleDeleteClick}
            disabled={isDeleteLoading}
            aria-label="배경화면 삭제"
          >
            {isDeleteLoading ? (
              <span className="loading-spinner">⟳</span>
            ) : (
              <span className="delete-icon">🗑️</span>
            )}
          </button>
        )}
      </div>

      {/* 배경화면 정보 */}
      <div className="wallpaper-card__info">
        <h3 className="wallpaper-card__title">{wallpaper.title}</h3>
        
        {/* 통계 정보 */}
        <div className="wallpaper-card__stats">
          <span className="stat">
            <span className="stat-icon">❤️</span>
            <span className="stat-value">{wallpaper.likeCount}</span>
          </span>
          <span className="stat">
            <span className="stat-icon">⬇️</span>
            <span className="stat-value">{wallpaper.downloadCount}</span>
          </span>
        </div>

        {/* 태그 (최대 3개만 표시) */}
        {wallpaper.tags.length > 0 && (
          <div className="wallpaper-card__tags">
            {wallpaper.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="tag">
                {tag}
              </span>
            ))}
            {wallpaper.tags.length > 3 && (
              <span className="tag-more">+{wallpaper.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}