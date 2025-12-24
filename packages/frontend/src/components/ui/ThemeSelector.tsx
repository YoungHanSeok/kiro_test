/**
 * 테마 선택기 컴포넌트
 * 테마 목록을 표시하고 선택 기능을 제공하며 선택된 테마를 하이라이트
 */

import { useState, useEffect } from 'react'
import './ThemeSelector.css'
import { useAppContext } from '../../context'
import { themeApi } from '../../api'
import type { Theme } from '@wallpaper-website/shared'
import './ThemeSelector.css'

interface ThemeSelectorProps {
  /** 테마 선택 시 호출되는 콜백 */
  onThemeSelect?: (theme: Theme | null) => void
  /** 레이아웃 타입 */
  layout?: 'horizontal' | 'vertical' | 'grid'
  /** 모든 테마 옵션 표시 여부 */
  showAllOption?: boolean
  /** 컴팩트 모드 */
  compact?: boolean
  /** 로딩 상태 */
  loading?: boolean
}

export function ThemeSelector({
  onThemeSelect,
  layout = 'horizontal',
  showAllOption = true,
  compact = false,
  loading = false
}: ThemeSelectorProps) {
  const { state, dispatch } = useAppContext()
  const [themes, setThemes] = useState<Theme[]>([])
  const [isLoading, setIsLoading] = useState(loading)
  const [error, setError] = useState<string | null>(null)

  // 테마 목록 로드
  useEffect(() => {
    const loadThemes = async () => {
      if (themes.length > 0) return // 이미 로드된 경우 스킵

      setIsLoading(true)
      setError(null)

      try {
        const fetchedThemes = await themeApi.getAll()
        
        // 활성화된 테마만 필터링하고 정렬 순서대로 정렬
        const activeThemes = fetchedThemes
          .filter(theme => theme.isActive)
          .sort((a, b) => a.sortOrder - b.sortOrder)
        
        setThemes(activeThemes)
        dispatch({ type: 'SET_THEMES', payload: activeThemes })
      } catch (err) {
        console.error('테마 로드 중 오류 발생:', err)
        setError('테마를 불러오는 중 오류가 발생했습니다.')
        dispatch({ 
          type: 'SET_ERROR', 
          payload: '테마를 불러오는 중 오류가 발생했습니다.' 
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadThemes()
  }, [themes.length, dispatch])

  // 테마 선택 핸들러
  const handleThemeSelect = (theme: Theme | null) => {
    dispatch({ type: 'SET_SELECTED_THEME', payload: theme })
    
    if (onThemeSelect) {
      onThemeSelect(theme)
    }
  }

  // 로딩 스켈레톤 렌더링
  const renderSkeletons = () => {
    const skeletonCount = compact ? 4 : 6
    return Array.from({ length: skeletonCount }, (_, index) => (
      <div key={`skeleton-${index}`} className="theme-skeleton">
        <div className="theme-skeleton__icon" />
        <div className="theme-skeleton__name" />
        {!compact && <div className="theme-skeleton__count" />}
      </div>
    ))
  }

  // 테마 아이템 렌더링
  const renderThemeItem = (theme: Theme | null, isSelected: boolean) => {
    const isAllThemes = theme === null
    
    return (
      <button
        key={isAllThemes ? 'all-themes' : theme.id}
        className={`theme-item ${isSelected ? 'selected' : ''} ${compact ? 'compact' : ''}`}
        onClick={() => handleThemeSelect(theme)}
        aria-label={isAllThemes ? '모든 테마' : `${theme.name} 테마`}
        aria-pressed={isSelected}
      >
        {/* 테마 아이콘 */}
        <div className="theme-item__icon">
          {isAllThemes ? (
            <span className="all-themes-icon">🎨</span>
          ) : theme.iconUrl ? (
            <img 
              src={theme.iconUrl} 
              alt={`${theme.name} 아이콘`}
              className="theme-icon-image"
              onError={(e) => {
                // 이미지 로딩 실패 시 기본 아이콘으로 대체
                const target = e.currentTarget as HTMLImageElement
                target.style.display = 'none'
                const fallback = target.nextElementSibling as HTMLElement
                if (fallback) {
                  fallback.style.display = 'block'
                }
              }}
            />
          ) : null}
          {!isAllThemes && (
            <span 
              className="theme-icon-fallback"
              style={{ display: theme.iconUrl ? 'none' : 'block' }}
            >
              🖼️
            </span>
          )}
        </div>

        {/* 테마 정보 */}
        <div className="theme-item__info">
          <span className="theme-item__name">
            {isAllThemes ? '모든 테마' : theme.name}
          </span>
          {!compact && (
            <span className="theme-item__count">
              {isAllThemes 
                ? `${themes.reduce((sum, t) => sum + t.wallpaperCount, 0)}개`
                : `${theme.wallpaperCount}개`
              }
            </span>
          )}
        </div>

        {/* 선택 표시 */}
        {isSelected && (
          <div className="theme-item__selected-indicator">
            ✓
          </div>
        )}
      </button>
    )
  }

  if (error) {
    return (
      <div className="theme-selector error">
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
          <button 
            className="retry-button"
            onClick={() => {
              setError(null)
              setThemes([])
            }}
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`theme-selector ${layout} ${compact ? 'compact' : ''}`}>
      {/* 제목 (컴팩트 모드가 아닐 때만 표시) */}
      {!compact && (
        <h3 className="theme-selector__title">테마 선택</h3>
      )}

      {/* 테마 목록 */}
      <div className="theme-selector__list">
        {isLoading ? (
          renderSkeletons()
        ) : (
          <>
            {/* 모든 테마 옵션 */}
            {showAllOption && renderThemeItem(null, state.selectedTheme === null)}
            
            {/* 개별 테마들 */}
            {themes.map(theme => 
              renderThemeItem(theme, state.selectedTheme?.id === theme.id)
            )}
          </>
        )}
      </div>

      {/* 빈 상태 */}
      {!isLoading && themes.length === 0 && !error && (
        <div className="theme-selector__empty">
          <span className="empty-icon">📂</span>
          <span>사용 가능한 테마가 없습니다.</span>
        </div>
      )}
    </div>
  )
}