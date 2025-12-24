/**
 * 배경화면 그리드 컴포넌트
 * 반응형 그리드 레이아웃으로 배경화면 목록을 표시하고 무한 스크롤 또는 페이지네이션을 지원
 */

import { useState, useEffect, useCallback } from 'react'
import './WallpaperGrid.css'
import { WallpaperCard } from './WallpaperCard'
import { WallpaperGridSkeleton } from './SkeletonLoader'
import { LoadingSpinner } from './LoadingSpinner'
import { useScreenSize, useSwipe, useIsTouchDevice } from '../../hooks'
import type { Wallpaper } from '@wallpaper-website/shared'

interface WallpaperGridProps {
  /** 표시할 배경화면 목록 */
  wallpapers: Wallpaper[]
  /** 로딩 상태 */
  loading?: boolean
  /** 더 많은 데이터가 있는지 여부 */
  hasMore?: boolean
  /** 더 많은 데이터를 로드하는 함수 */
  onLoadMore?: () => void
  /** 배경화면 카드 클릭 시 호출되는 콜백 */
  onWallpaperClick?: (wallpaper: Wallpaper) => void
  /** 배경화면 삭제 시 호출되는 콜백 */
  onWallpaperDelete?: () => void
  /** 그리드 레이아웃 타입 */
  layout?: 'masonry' | 'grid'
  /** 페이지네이션 모드 (무한 스크롤 vs 페이지네이션) */
  paginationMode?: 'infinite' | 'pagination'
  /** 현재 페이지 (페이지네이션 모드에서 사용) */
  currentPage?: number
  /** 전체 페이지 수 (페이지네이션 모드에서 사용) */
  totalPages?: number
  /** 페이지 변경 콜백 (페이지네이션 모드에서 사용) */
  onPageChange?: (page: number) => void
  /** 모바일에서 광고 삽입 간격 (몇 개마다 광고를 삽입할지) */
  mobileAdInterval?: number
}

export function WallpaperGrid({
  wallpapers,
  loading = false,
  hasMore = false,
  onLoadMore,
  onWallpaperClick,
  onWallpaperDelete,
  layout = 'grid',
  paginationMode = 'infinite',
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  mobileAdInterval = 8
}: WallpaperGridProps) {
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const screenSize = useScreenSize()
  const isTouchDevice = useIsTouchDevice()

  // 화면 크기에 따른 스켈레톤 개수 조정
  const getSkeletonCount = () => {
    switch (screenSize) {
      case 'mobile': return 4
      case 'tablet': return 6
      case 'desktop': return 8
      case 'wide': return 12
      default: return 8
    }
  }

  // 무한 스크롤 처리
  const handleScroll = useCallback(() => {
    if (paginationMode !== 'infinite' || !hasMore || loading || isLoadingMore || !onLoadMore) {
      return
    }

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const scrollHeight = document.documentElement.scrollHeight
    const clientHeight = window.innerHeight

    // 페이지 하단에서 200px 전에 로드 시작
    if (scrollTop + clientHeight >= scrollHeight - 200) {
      setIsLoadingMore(true)
      onLoadMore()
    }
  }, [paginationMode, hasMore, loading, isLoadingMore, onLoadMore])

  // 스크롤 이벤트 리스너 등록
  useEffect(() => {
    if (paginationMode === 'infinite') {
      window.addEventListener('scroll', handleScroll, { passive: true })
      return () => window.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll, paginationMode])

  // 로딩 완료 시 상태 리셋
  useEffect(() => {
    if (!loading) {
      setIsLoadingMore(false)
    }
  }, [loading])

  // 페이지네이션 버튼 생성
  const renderPagination = () => {
    if (paginationMode !== 'pagination' || !onPageChange || totalPages <= 1) {
      return null
    }

    const pages = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    // 끝 페이지가 조정되면 시작 페이지도 조정
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    // 이전 페이지 버튼
    if (currentPage > 1) {
      pages.push(
        <button
          key="prev"
          className="pagination-button"
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="이전 페이지"
        >
          ‹
        </button>
      )
    }

    // 첫 페이지
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          className="pagination-button"
          onClick={() => onPageChange(1)}
        >
          1
        </button>
      )
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis1" className="pagination-ellipsis">
            ...
          </span>
        )
      }
    }

    // 페이지 번호들
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`pagination-button ${i === currentPage ? 'active' : ''}`}
          onClick={() => onPageChange(i)}
        >
          {i}
        </button>
      )
    }

    // 마지막 페이지
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis2" className="pagination-ellipsis">
            ...
          </span>
        )
      }
      pages.push(
        <button
          key={totalPages}
          className="pagination-button"
          onClick={() => onPageChange(totalPages)}
        >
          {totalPages}
        </button>
      )
    }

    // 다음 페이지 버튼
    if (currentPage < totalPages) {
      pages.push(
        <button
          key="next"
          className="pagination-button"
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="다음 페이지"
        >
          ›
        </button>
      )
    }

    return (
      <div className="wallpaper-grid__pagination">
        {pages}
      </div>
    )
  }

  // 로딩 스켈레톤 렌더링
  const renderSkeletons = (count?: number) => {
    const skeletonCount = count || getSkeletonCount()
    return <WallpaperGridSkeleton count={skeletonCount} layout={layout} />
  }

  return (
    <div className={`wallpaper-grid wallpaper-grid--${screenSize} ${isTouchDevice ? 'wallpaper-grid--touch' : ''}`}>
      {/* 배경화면 그리드 */}
      <div className={`wallpaper-grid__container ${layout}`}>
        {wallpapers.map((wallpaper) => (
          <WallpaperCard
            key={wallpaper.id}
            wallpaper={wallpaper}
            onClick={onWallpaperClick}
            onDelete={onWallpaperDelete}
          />
        ))}
        
        {/* 로딩 중일 때 스켈레톤 표시 */}
        {loading && renderSkeletons()}
      </div>

      {/* 빈 상태 */}
      {!loading && wallpapers.length === 0 && (
        <div className="wallpaper-grid__empty">
          <div className="empty-icon">🖼️</div>
          <h3>배경화면이 없습니다</h3>
          <p>조건에 맞는 배경화면을 찾을 수 없습니다.</p>
        </div>
      )}

      {/* 무한 스크롤 로딩 인디케이터 */}
      {paginationMode === 'infinite' && isLoadingMore && (
        <div className="wallpaper-grid__loading">
          <LoadingSpinner 
            size="medium" 
            message="더 많은 배경화면을 불러오는 중..." 
            inline={true}
          />
        </div>
      )}

      {/* 페이지네이션 */}
      {renderPagination()}

      {/* 무한 스크롤 끝 메시지 */}
      {paginationMode === 'infinite' && !hasMore && wallpapers.length > 0 && (
        <div className="wallpaper-grid__end">
          <p>모든 배경화면을 확인했습니다.</p>
        </div>
      )}
    </div>
  )
}