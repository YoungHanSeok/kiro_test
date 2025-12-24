/**
 * 터치 제스처 훅
 * 터치 이벤트를 처리하는 재사용 가능한 훅들
 */

import { useRef, useEffect, useCallback } from 'react'

interface TouchPosition {
  x: number
  y: number
}

interface SwipeHandlers {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
}

interface SwipeOptions {
  threshold?: number // 스와이프로 인식할 최소 거리 (px)
  velocity?: number  // 스와이프로 인식할 최소 속도 (px/ms)
}

// 스와이프 제스처 훅
export function useSwipe(
  handlers: SwipeHandlers,
  options: SwipeOptions = {}
) {
  const { threshold = 50, velocity = 0.3 } = options
  const touchStart = useRef<TouchPosition | null>(null)
  const touchEnd = useRef<TouchPosition | null>(null)
  const startTime = useRef<number>(0)

  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchEnd.current = null
    touchStart.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    }
    startTime.current = Date.now()
  }, [])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    touchEnd.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    }
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (!touchStart.current || !touchEnd.current) return

    const deltaX = touchStart.current.x - touchEnd.current.x
    const deltaY = touchStart.current.y - touchEnd.current.y
    const deltaTime = Date.now() - startTime.current
    
    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)
    const velocityX = absX / deltaTime
    const velocityY = absY / deltaTime

    // 수평 스와이프가 더 큰 경우
    if (absX > absY && absX > threshold && velocityX > velocity) {
      if (deltaX > 0) {
        handlers.onSwipeLeft?.()
      } else {
        handlers.onSwipeRight?.()
      }
    }
    // 수직 스와이프가 더 큰 경우
    else if (absY > threshold && velocityY > velocity) {
      if (deltaY > 0) {
        handlers.onSwipeUp?.()
      } else {
        handlers.onSwipeDown?.()
      }
    }
  }, [handlers, threshold, velocity])

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  }
}

// 길게 누르기 제스처 훅
export function useLongPress(
  onLongPress: () => void,
  options: {
    threshold?: number // 길게 누르기로 인식할 시간 (ms)
    onStart?: () => void
    onFinish?: () => void
    onCancel?: () => void
  } = {}
) {
  const { threshold = 500, onStart, onFinish, onCancel } = options
  const isLongPressActive = useRef(false)
  const isPressed = useRef(false)
  const timerId = useRef<NodeJS.Timeout>()

  const start = useCallback(() => {
    if (isPressed.current) return
    
    isPressed.current = true
    onStart?.()

    timerId.current = setTimeout(() => {
      if (isPressed.current) {
        isLongPressActive.current = true
        onLongPress()
      }
    }, threshold)
  }, [onLongPress, onStart, threshold])

  const cancel = useCallback(() => {
    if (timerId.current) {
      clearTimeout(timerId.current)
    }
    
    if (isLongPressActive.current) {
      onFinish?.()
    } else if (isPressed.current) {
      onCancel?.()
    }
    
    isLongPressActive.current = false
    isPressed.current = false
  }, [onFinish, onCancel])

  return {
    onMouseDown: start,
    onMouseUp: cancel,
    onMouseLeave: cancel,
    onTouchStart: start,
    onTouchEnd: cancel,
    onTouchCancel: cancel
  }
}

// 핀치 줌 제스처 훅
export function usePinchZoom(
  onZoom: (scale: number, center: TouchPosition) => void,
  options: {
    minScale?: number
    maxScale?: number
  } = {}
) {
  const { minScale = 0.5, maxScale = 3 } = options
  const initialDistance = useRef<number>(0)
  const initialScale = useRef<number>(1)
  const lastScale = useRef<number>(1)

  const getDistance = (touches: TouchList): number => {
    const touch1 = touches[0]
    const touch2 = touches[1]
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    )
  }

  const getCenter = (touches: TouchList): TouchPosition => {
    const touch1 = touches[0]
    const touch2 = touches[1]
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2
    }
  }

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault()
      initialDistance.current = getDistance(e.touches)
      initialScale.current = lastScale.current
    }
  }, [])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault()
      const currentDistance = getDistance(e.touches)
      const scale = Math.max(
        minScale,
        Math.min(maxScale, initialScale.current * (currentDistance / initialDistance.current))
      )
      const center = getCenter(e.touches)
      
      lastScale.current = scale
      onZoom(scale, center)
    }
  }, [onZoom, minScale, maxScale])

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove
  }
}