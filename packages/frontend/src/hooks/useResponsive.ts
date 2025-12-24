/**
 * 반응형 디자인 훅
 * 화면 크기에 따른 반응형 동작을 처리하는 훅
 */

import { useState, useEffect } from 'react'

// 브레이크포인트 정의
export const breakpoints = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  wide: 1200
} as const

export type Breakpoint = keyof typeof breakpoints
export type ScreenSize = 'mobile' | 'tablet' | 'desktop' | 'wide'

// 현재 화면 크기 감지 훅
export function useScreenSize(): ScreenSize {
  const [screenSize, setScreenSize] = useState<ScreenSize>(() => {
    if (typeof window === 'undefined') return 'desktop'
    
    const width = window.innerWidth
    if (width < breakpoints.mobile) return 'mobile'
    if (width < breakpoints.tablet) return 'tablet'
    if (width < breakpoints.desktop) return 'desktop'
    return 'wide'
  })

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      let newSize: ScreenSize
      
      if (width < breakpoints.mobile) {
        newSize = 'mobile'
      } else if (width < breakpoints.tablet) {
        newSize = 'tablet'
      } else if (width < breakpoints.desktop) {
        newSize = 'desktop'
      } else {
        newSize = 'wide'
      }
      
      setScreenSize(newSize)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return screenSize
}

// 특정 브레이크포인트 이상인지 확인하는 훅
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    const handleChange = () => setMatches(mediaQuery.matches)
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [query])

  return matches
}

// 모바일 여부 확인 훅
export function useIsMobile(): boolean {
  return useMediaQuery(`(max-width: ${breakpoints.tablet - 1}px)`)
}

// 태블릿 여부 확인 훅
export function useIsTablet(): boolean {
  return useMediaQuery(`(min-width: ${breakpoints.tablet}px) and (max-width: ${breakpoints.desktop - 1}px)`)
}

// 데스크톱 여부 확인 훅
export function useIsDesktop(): boolean {
  return useMediaQuery(`(min-width: ${breakpoints.desktop}px)`)
}

// 터치 디바이스 여부 확인 훅
export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    const checkTouch = () => {
      setIsTouch(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-ignore
        navigator.msMaxTouchPoints > 0
      )
    }

    checkTouch()
    window.addEventListener('touchstart', checkTouch, { once: true })
    
    return () => {
      window.removeEventListener('touchstart', checkTouch)
    }
  }, [])

  return isTouch
}

// 화면 방향 감지 훅
export function useOrientation(): 'portrait' | 'landscape' {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(() => {
    if (typeof window === 'undefined') return 'portrait'
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
  })

  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape')
    }

    window.addEventListener('resize', handleOrientationChange)
    window.addEventListener('orientationchange', handleOrientationChange)
    
    return () => {
      window.removeEventListener('resize', handleOrientationChange)
      window.removeEventListener('orientationchange', handleOrientationChange)
    }
  }, [])

  return orientation
}

// 반응형 값 선택 훅
export function useResponsiveValue<T>(values: {
  mobile?: T
  tablet?: T
  desktop?: T
  wide?: T
  default: T
}): T {
  const screenSize = useScreenSize()
  
  return values[screenSize] ?? values.default
}