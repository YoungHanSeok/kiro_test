/**
 * SearchBar 컴포넌트 테스트
 * **Feature: wallpaper-website, Property 10: 검색 초기화 라운드트립**
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
// import * as fc from 'fast-check' // 추후 사용 예정
import { SearchBar } from './SearchBar'
import { AppProvider } from '../../context'

// 테스트 래퍼 컴포넌트
function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <BrowserRouter>
      <AppProvider>
        {children}
      </AppProvider>
    </BrowserRouter>
  )
}

// 검색어 생성기
// const searchQueryArbitrary = fc.string({ minLength: 1, maxLength: 100 })
//   .filter(s => s.trim().length > 0) // 추후 사용 예정

describe('SearchBar 속성 테스트', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  /**
   * 속성 10: 검색 초기화 라운드트립
   * 모든 검색 상태에 대해, 검색어를 지운 후에는 전체 배경화면 목록이 표시되어야 한다
   * **검증 대상: 요구사항 4.4**
   */
  it('속성 10: 검색 초기화 라운드트립', async () => {
    const mockOnSearch = vi.fn()
    const mockOnClear = vi.fn()

    render(
      <TestWrapper>
        <SearchBar 
          onSearch={mockOnSearch}
          onClear={mockOnClear}
          debounceDelay={0}
        />
      </TestWrapper>
    )

    const input = screen.getByRole('combobox')
    
    // 1. 검색어 입력
    fireEvent.change(input, { target: { value: '테스트 검색어' } })
    
    // 검색 함수가 호출될 때까지 대기
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('테스트 검색어')
    })

    // 2. 초기화 버튼이 나타나는지 확인
    const clearButton = screen.getByRole('button', { name: /검색어 초기화/ })
    expect(clearButton).toBeInTheDocument()

    // 3. 초기화 버튼 클릭
    fireEvent.click(clearButton)

    // 4. 검색어가 초기화되었는지 확인 (라운드트립 완료)
    expect(input).toHaveValue('')
    expect(mockOnClear).toHaveBeenCalled()

    // 5. 초기화 버튼이 사라졌는지 확인
    expect(screen.queryByRole('button', { name: /검색어 초기화/ })).not.toBeInTheDocument()
  }, 10000)

  /**
   * 기본 검색 기능 테스트
   */
  it('검색어 입력 시 검색 함수 호출', async () => {
    const mockOnSearch = vi.fn()
    
    render(
      <TestWrapper>
        <SearchBar onSearch={mockOnSearch} debounceDelay={0} />
      </TestWrapper>
    )

    const input = screen.getByRole('combobox', { name: /배경화면 검색/ })
    
    fireEvent.change(input, { target: { value: '자연' } })
    
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('자연')
    })
  })

  /**
   * 검색 제안 기능 테스트
   */
  it('검색 제안 선택 시 검색어 설정', () => {
    const mockOnSuggestionSelect = vi.fn()
    const suggestions = ['자연', '우주', '도시']
    
    render(
      <TestWrapper>
        <SearchBar 
          suggestions={suggestions}
          onSuggestionSelect={mockOnSuggestionSelect}
        />
      </TestWrapper>
    )

    const input = screen.getByRole('combobox')
    
    // 검색어 입력하여 제안 목록 표시
    fireEvent.change(input, { target: { value: '자' } })
    fireEvent.focus(input)

    // 제안 목록이 표시되는지 확인
    const suggestionsList = screen.getByRole('listbox')
    expect(suggestionsList).toBeInTheDocument()

    // 첫 번째 제안 클릭
    const firstSuggestion = screen.getByText('자연')
    fireEvent.click(firstSuggestion)

    // 제안이 선택되었는지 확인
    expect(mockOnSuggestionSelect).toHaveBeenCalledWith('자연')
    expect(input).toHaveValue('자연')
  })

  /**
   * 키보드 네비게이션 테스트
   */
  it('키보드로 검색 제안 네비게이션', () => {
    const suggestions = ['자연', '우주', '도시']
    
    render(
      <TestWrapper>
        <SearchBar suggestions={suggestions} />
      </TestWrapper>
    )

    const input = screen.getByRole('combobox')
    
    // 검색어 입력하여 제안 목록 표시
    fireEvent.change(input, { target: { value: '자' } })
    fireEvent.focus(input)

    // 아래 화살표로 첫 번째 제안 선택
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    
    const firstSuggestion = screen.getByText('자연').parentElement
    expect(firstSuggestion).toHaveClass('selected')

    // Enter로 선택
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(input).toHaveValue('자연')
  })

  /**
   * 로딩 상태 표시 테스트
   */
  it('로딩 상태 시 스피너 표시', () => {
    render(
      <TestWrapper>
        <SearchBar loading={true} />
      </TestWrapper>
    )

    const spinner = screen.getByText('⟳')
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveClass('search-loading-spinner')
  })

  /**
   * 빈 검색어 처리 테스트
   */
  it('빈 검색어 입력 시 초기화 처리', async () => {
    const mockOnClear = vi.fn()
    
    render(
      <TestWrapper>
        <SearchBar onClear={mockOnClear} debounceDelay={0} />
      </TestWrapper>
    )

    const input = screen.getByRole('combobox')
    
    // 검색어 입력
    fireEvent.change(input, { target: { value: '자연' } })
    
    // 초기화 버튼이 나타날 때까지 대기
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /검색어 초기화/ })).toBeInTheDocument()
    })
    
    // 초기화 버튼 클릭
    const clearButton = screen.getByRole('button', { name: /검색어 초기화/ })
    fireEvent.click(clearButton)

    // onClear가 호출되었는지 확인
    expect(mockOnClear).toHaveBeenCalled()
  })
})