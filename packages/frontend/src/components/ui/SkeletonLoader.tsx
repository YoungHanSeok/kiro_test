/**
 * 스켈레톤 로더 컴포넌트
 * 이미지 로딩 중 스켈레톤 UI를 표시하는 재사용 가능한 컴포넌트
 */

import React from 'react'
import './SkeletonLoader.css'

interface SkeletonLoaderProps {
  /** 스켈레톤 타입 */
  variant?: 'text' | 'rectangular' | 'circular' | 'wallpaper-card'
  /** 너비 */
  width?: string | number
  /** 높이 */
  height?: string | number
  /** 애니메이션 여부 */
  animation?: boolean
  /** 커스텀 클래스명 */
  className?: string
  /** 반복 횟수 (여러 개의 스켈레톤을 표시할 때) */
  count?: number
}

export function SkeletonLoader({
  variant = 'rectangular',
  width,
  height,
  animation = true,
  className = '',
  count = 1
}: SkeletonLoaderProps) {
  const skeletonClasses = [
    'skeleton-loader',
    `skeleton-loader--${variant}`,
    animation && 'skeleton-loader--animated',
    className
  ].filter(Boolean).join(' ')

  const style: React.CSSProperties = {}
  if (width) style.width = typeof width === 'number' ? `${width}px` : width
  if (height) style.height = typeof height === 'number' ? `${height}px` : height

  // 배경화면 카드 스켈레톤
  if (variant === 'wallpaper-card') {
    return (
      <div className="skeleton-wallpaper-card">
        <div className="skeleton-wallpaper-card__image" />
        <div className="skeleton-wallpaper-card__info">
          <div className="skeleton-wallpaper-card__title" />
          <div className="skeleton-wallpaper-card__stats" />
          <div className="skeleton-wallpaper-card__tags">
            <div className="skeleton-tag" />
            <div className="skeleton-tag" />
            <div className="skeleton-tag" />
          </div>
        </div>
      </div>
    )
  }

  // 여러 개의 스켈레톤 렌더링
  if (count > 1) {
    return (
      <>
        {Array.from({ length: count }, (_, index) => (
          <div
            key={index}
            className={skeletonClasses}
            style={style}
          />
        ))}
      </>
    )
  }

  return (
    <div
      className={skeletonClasses}
      style={style}
    />
  )
}

// 배경화면 그리드용 스켈레톤 컴포넌트
interface WallpaperGridSkeletonProps {
  /** 스켈레톤 카드 개수 */
  count?: number
  /** 그리드 레이아웃 */
  layout?: 'grid' | 'masonry'
}

export function WallpaperGridSkeleton({ 
  count = 8, 
  layout = 'grid' 
}: WallpaperGridSkeletonProps) {
  return (
    <div className={`skeleton-grid skeleton-grid--${layout}`}>
      {Array.from({ length: count }, (_, index) => (
        <SkeletonLoader
          key={index}
          variant="wallpaper-card"
        />
      ))}
    </div>
  )
}