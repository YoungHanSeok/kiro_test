/**
 * 지연 로딩 이미지 컴포넌트
 * 이미지 로딩 중 스켈레톤을 표시하고 오류 시 대체 이미지를 표시
 */

import React, { useState, useRef, useEffect } from 'react'
import { SkeletonLoader } from './SkeletonLoader'
import './LazyImage.css'

interface LazyImageProps {
  /** 이미지 소스 URL */
  src: string
  /** 대체 텍스트 */
  alt: string
  /** 대체 이미지 URL (로딩 실패 시) */
  fallbackSrc?: string
  /** 이미지 클래스명 */
  className?: string
  /** 이미지 스타일 */
  style?: React.CSSProperties
  /** 로딩 중 표시할 스켈레톤 높이 */
  skeletonHeight?: string | number
  /** 지연 로딩 여부 */
  lazy?: boolean
  /** 이미지 로드 완료 콜백 */
  onLoad?: () => void
  /** 이미지 로드 오류 콜백 */
  onError?: () => void
  /** 클릭 이벤트 핸들러 */
  onClick?: () => void
}

export function LazyImage({
  src,
  alt,
  fallbackSrc = '/images/placeholder-wallpaper.svg',
  className = '',
  style,
  skeletonHeight = '200px',
  lazy = true,
  onLoad,
  onError,
  onClick
}: LazyImageProps) {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading')
  const [imageSrc, setImageSrc] = useState(src)
  const [isInView, setIsInView] = useState(!lazy)
  const imgRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Intersection Observer를 사용한 지연 로딩
  useEffect(() => {
    if (!lazy || isInView) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.disconnect()
          }
        })
      },
      {
        rootMargin: '50px' // 50px 전에 미리 로딩 시작
      }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [lazy, isInView])

  // 이미지 로드 핸들러
  const handleImageLoad = () => {
    setImageState('loaded')
    onLoad?.()
  }

  // 이미지 오류 핸들러
  const handleImageError = () => {
    if (imageSrc !== fallbackSrc) {
      // 첫 번째 오류 시 대체 이미지로 변경
      setImageSrc(fallbackSrc)
    } else {
      // 대체 이미지도 실패한 경우
      setImageState('error')
      onError?.()
    }
  }

  // 이미지 소스 변경 시 상태 리셋
  useEffect(() => {
    if (src !== imageSrc) {
      setImageSrc(src)
      setImageState('loading')
    }
  }, [src, imageSrc])

  const containerClasses = [
    'lazy-image',
    className,
    imageState === 'loaded' && 'lazy-image--loaded',
    imageState === 'error' && 'lazy-image--error'
  ].filter(Boolean).join(' ')

  return (
    <div 
      ref={containerRef}
      className={containerClasses}
      style={style}
      onClick={onClick}
    >
      {/* 로딩 중 스켈레톤 */}
      {imageState === 'loading' && (
        <div className="lazy-image__skeleton">
          <SkeletonLoader
            variant="rectangular"
            width="100%"
            height={skeletonHeight}
          />
        </div>
      )}

      {/* 실제 이미지 */}
      {isInView && (
        <img
          ref={imgRef}
          src={imageSrc}
          alt={alt}
          className={`lazy-image__img ${imageState === 'loaded' ? 'loaded' : ''}`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading={lazy ? 'lazy' : 'eager'}
        />
      )}

      {/* 오류 상태 */}
      {imageState === 'error' && (
        <div className="lazy-image__error">
          <div className="error-icon">🖼️</div>
          <div className="error-message">이미지를 불러올 수 없습니다</div>
        </div>
      )}
    </div>
  )
}