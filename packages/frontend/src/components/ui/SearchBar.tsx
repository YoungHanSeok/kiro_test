/**
 * 검색 바 컴포넌트
 * 실시간 검색 기능과 검색어 입력 및 초기화 기능을 제공
 */

import React, { useState, useEffect, useCallback, useRef } from 'react'
import './SearchBar.css'
import { useAppContext } from '../../context'
import { useIsMobile, useIsTouchDevice } from '../../hooks'

interface SearchBarProps {
  /** 검색어 변경 시 호출되는 콜백 */
  onSearch?: (query: string) => void
  /** 검색어 초기화 시 호출되는 콜백 */
  onClear?: () => void
  /** 플레이스홀더 텍스트 */
  placeholder?: string
  /** 실시간 검색 딜레이 (ms) */
  debounceDelay?: number
  /** 자동 포커스 여부 */
  autoFocus?: boolean
  /** 검색 제안 목록 */
  suggestions?: string[]
  /** 검색 제안 선택 시 호출되는 콜백 */
  onSuggestionSelect?: (suggestion: string) => void
  /** 로딩 상태 */
  loading?: boolean
}

export function SearchBar({
  onSearch,
  onClear,
  placeholder = '배경화면을 검색하세요...',
  debounceDelay = 300,
  autoFocus = false,
  suggestions = [],
  onSuggestionSelect,
  loading = false
}: SearchBarProps) {
  const { state, dispatch } = useAppContext()
  const [localQuery, setLocalQuery] = useState(state.searchQuery)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const [isComposing, setIsComposing] = useState(false) // 한글 입력 중 상태
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()
  const isMobile = useIsMobile()
  const isTouchDevice = useIsTouchDevice()

  // 검색어 유효성 검사 함수
  const isValidSearchQuery = useCallback((query: string): boolean => {
    const trimmedQuery = query.trim()
    
    // 빈 문자열 체크
    if (!trimmedQuery) return false
    
    // 최소 길이 체크 (2글자 이상)
    if (trimmedQuery.length < 2) return false
    
    // 한글 자모만 있는지 체크 (완성된 한글이 아닌 자음/모음만)
    const koreanJamoRegex = /^[ㄱ-ㅎㅏ-ㅣ]+$/
    if (koreanJamoRegex.test(trimmedQuery)) return false
    
    return true
  }, [])

  // 디바운스된 검색 실행
  const debouncedSearch = useCallback((query: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      // 유효한 검색어인지 확인
      if (isValidSearchQuery(query)) {
        dispatch({ type: 'SET_SEARCH_QUERY', payload: query })
        if (onSearch) {
          onSearch(query)
        }
      }
    }, debounceDelay)
  }, [dispatch, onSearch, debounceDelay, isValidSearchQuery])

  // 입력값 변경 처리
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setLocalQuery(query)
    setSelectedSuggestionIndex(-1)
    
    // 빈 문자열인 경우 검색 상태 초기화
    if (!query.trim()) {
      setShowSuggestions(false)
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
      dispatch({ type: 'SET_SEARCH_QUERY', payload: '' })
      if (onClear) {
        onClear()
      }
      return
    }
    
    // 제안 목록 표시
    setShowSuggestions(suggestions.length > 0)
    
    // 한글 입력 중이 아닐 때만 검색 실행
    if (!isComposing) {
      debouncedSearch(query.trim())
    }
  }, [isComposing, suggestions.length, debouncedSearch, dispatch, onClear])

  // 한글 입력 시작
  const handleCompositionStart = useCallback(() => {
    setIsComposing(true)
  }, [])

  // 한글 입력 완료
  const handleCompositionEnd = useCallback((e: React.CompositionEvent<HTMLInputElement>) => {
    setIsComposing(false)
    const query = e.currentTarget.value.trim()
    
    // 한글 입력이 완료된 후 검색 실행
    if (query) {
      debouncedSearch(query)
    }
  }, [debouncedSearch])

  // 검색어 초기화
  const handleClear = () => {
    setLocalQuery('')
    setShowSuggestions(false)
    setSelectedSuggestionIndex(-1)
    dispatch({ type: 'SET_SEARCH_QUERY', payload: '' })
    
    if (onClear) {
      onClear()
    }
    
    // 입력 필드에 포커스
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  // 키보드 이벤트 처리
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter' && localQuery.trim()) {
        debouncedSearch(localQuery.trim())
        setShowSuggestions(false)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        )
        break
      
      case 'ArrowUp':
        e.preventDefault()
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        )
        break
      
      case 'Enter':
        e.preventDefault()
        if (selectedSuggestionIndex >= 0) {
          handleSuggestionClick(suggestions[selectedSuggestionIndex])
        } else if (localQuery.trim()) {
          debouncedSearch(localQuery.trim())
          setShowSuggestions(false)
        }
        break
      
      case 'Escape':
        setShowSuggestions(false)
        setSelectedSuggestionIndex(-1)
        break
    }
  }

  // 검색 제안 클릭 처리
  const handleSuggestionClick = (suggestion: string) => {
    setLocalQuery(suggestion)
    setShowSuggestions(false)
    setSelectedSuggestionIndex(-1)
    dispatch({ type: 'SET_SEARCH_QUERY', payload: suggestion })
    
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion)
    }
    
    if (onSearch) {
      onSearch(suggestion)
    }
  }

  // 외부 클릭 시 제안 목록 숨기기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
        setSelectedSuggestionIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 전역 상태와 동기화 (localQuery를 의존성에서 제거하여 무한 루프 방지)
  useEffect(() => {
    if (state.searchQuery !== localQuery) {
      setLocalQuery(state.searchQuery)
    }
  }, [state.searchQuery])

  // 자동 포커스
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  // 컴포넌트 언마운트 시 디바운스 타이머 정리
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  return (
    <div className={`search-bar ${isMobile ? 'search-bar--mobile' : ''} ${isTouchDevice ? 'search-bar--touch' : ''}`}>
      <div className="search-bar__container">
        {/* 검색 아이콘 */}
        <div className="search-bar__icon">
          {loading ? (
            <div className="search-loading-spinner">⟳</div>
          ) : (
            <span className="search-icon">🔍</span>
          )}
        </div>

        {/* 검색 입력 필드 */}
        <input
          ref={inputRef}
          type="text"
          className="search-bar__input"
          placeholder={placeholder}
          value={localQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          onFocus={() => {
            if (suggestions.length > 0 && localQuery.trim()) {
              setShowSuggestions(true)
            }
          }}
          aria-label="배경화면 검색"
          aria-expanded={showSuggestions}
          aria-haspopup="listbox"
          role="combobox"
        />

        {/* 초기화 버튼 */}
        {localQuery && (
          <button
            className="search-bar__clear"
            onClick={handleClear}
            aria-label="검색어 초기화"
            type="button"
          >
            ✕
          </button>
        )}
      </div>

      {/* 검색 제안 목록 */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="search-bar__suggestions"
          role="listbox"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion}
              className={`search-suggestion ${
                index === selectedSuggestionIndex ? 'selected' : ''
              }`}
              onClick={() => handleSuggestionClick(suggestion)}
              role="option"
              aria-selected={index === selectedSuggestionIndex}
            >
              <span className="suggestion-icon">🔍</span>
              <span className="suggestion-text">{suggestion}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}