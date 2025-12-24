/**
 * 페이징 컴포넌트
 * 페이지 네비게이션 UI를 제공
 */

import { useMemo } from 'react'
import './Pagination.css'

interface PaginationProps {
  /** 현재 페이지 번호 (1부터 시작) */
  currentPage: number
  /** 전체 페이지 수 */
  totalPages: number
  /** 페이지 변경 시 호출되는 콜백 */
  onPageChange: (page: number) => void
  /** 표시할 페이지 버튼 수 (기본값: 5) */
  maxVisiblePages?: number
  /** 로딩 상태 */
  loading?: boolean
  /** 컴팩트 모드 (모바일용) */
  compact?: boolean
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 5,
  loading = false,
  compact = false
}: PaginationProps) {
  // 표시할 페이지 번호들 계산
  const visiblePages = useMemo(() => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const half = Math.floor(maxVisiblePages / 2)
    let start = Math.max(1, currentPage - half)
    let end = Math.min(totalPages, start + maxVisiblePages - 1)

    // 끝에서 시작점 조정
    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1)
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }, [currentPage, totalPages, maxVisiblePages])

  // 페이지가 1개 이하면 페이징 숨김
  if (totalPages <= 1) {
    return null
  }

  const handlePageClick = (page: number) => {
    if (page !== currentPage && !loading) {
      onPageChange(page)
    }
  }

  const handlePrevious = () => {
    if (currentPage > 1 && !loading) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages && !loading) {
      onPageChange(currentPage + 1)
    }
  }

  return (
    <nav className={`pagination ${compact ? 'compact' : ''} ${loading ? 'loading' : ''}`}>
      <div className="pagination__container">
        {/* 이전 페이지 버튼 */}
        <button
          className={`pagination__button pagination__button--prev ${currentPage === 1 ? 'disabled' : ''}`}
          onClick={handlePrevious}
          disabled={currentPage === 1 || loading}
          aria-label="이전 페이지"
        >
          {compact ? '‹' : '‹ 이전'}
        </button>

        {/* 페이지 번호들 */}
        <div className="pagination__pages">
          {/* 첫 페이지 (생략 표시가 있을 때) */}
          {visiblePages[0] > 1 && (
            <>
              <button
                className="pagination__button pagination__button--page"
                onClick={() => handlePageClick(1)}
                disabled={loading}
              >
                1
              </button>
              {visiblePages[0] > 2 && (
                <span className="pagination__ellipsis">...</span>
              )}
            </>
          )}

          {/* 표시할 페이지 번호들 */}
          {visiblePages.map(page => (
            <button
              key={page}
              className={`pagination__button pagination__button--page ${
                page === currentPage ? 'active' : ''
              }`}
              onClick={() => handlePageClick(page)}
              disabled={loading}
              aria-label={`${page}페이지`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          ))}

          {/* 마지막 페이지 (생략 표시가 있을 때) */}
          {visiblePages[visiblePages.length - 1] < totalPages && (
            <>
              {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                <span className="pagination__ellipsis">...</span>
              )}
              <button
                className="pagination__button pagination__button--page"
                onClick={() => handlePageClick(totalPages)}
                disabled={loading}
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        {/* 다음 페이지 버튼 */}
        <button
          className={`pagination__button pagination__button--next ${currentPage === totalPages ? 'disabled' : ''}`}
          onClick={handleNext}
          disabled={currentPage === totalPages || loading}
          aria-label="다음 페이지"
        >
          {compact ? '›' : '다음 ›'}
        </button>
      </div>

      {/* 페이지 정보 */}
      {!compact && (
        <div className="pagination__info">
          <span className="pagination__current">
            {currentPage} / {totalPages} 페이지
          </span>
        </div>
      )}
    </nav>
  )
}