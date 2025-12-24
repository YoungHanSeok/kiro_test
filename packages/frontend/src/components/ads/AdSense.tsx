/**
 * 구글 애드센스 광고 컴포넌트
 */

import { useEffect, useRef, useState } from 'react';

interface AdSenseProps {
  adSlot: string;
  adFormat?: 'auto' | 'rectangle' | 'vertical' | 'horizontal';
  adLayout?: string;
  adLayoutKey?: string;
  style?: React.CSSProperties;
  className?: string;
}

// 전역 애드센스 타입 선언
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export function AdSense({
  adSlot,
  adFormat = 'auto',
  adLayout,
  adLayoutKey,
  style = { display: 'block' },
  className = ''
}: AdSenseProps) {
  const adRef = useRef<HTMLModElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 컴포넌트가 마운트되고 DOM이 준비된 후 광고 로드
    const loadAd = () => {
      if (typeof window === 'undefined' || !adRef.current || isLoaded) {
        return;
      }

      // 컨테이너의 너비가 0이 아닌지 확인
      const container = containerRef.current;
      if (container && container.offsetWidth === 0) {
        // 너비가 0이면 잠시 후 다시 시도 (최대 10번)
        const retryCount = (container as any).retryCount || 0;
        if (retryCount < 10) {
          (container as any).retryCount = retryCount + 1;
          setTimeout(loadAd, 200);
        } else {
          console.warn('AdSense: 컨테이너 너비를 확인할 수 없어 광고 로드를 건너뜁니다.');
        }
        return;
      }

      // 이미 광고가 로드된 요소인지 확인
      const insElement = adRef.current;
      if (insElement.getAttribute('data-adsbygoogle-status')) {
        console.warn('AdSense: 이미 광고가 로드된 요소입니다.');
        return;
      }

      try {
        // 애드센스 스크립트가 로드되었는지 확인
        if (window.adsbygoogle) {
          // 광고 푸시
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          setIsLoaded(true);
        } else {
          console.warn('AdSense: adsbygoogle 스크립트가 로드되지 않았습니다.');
        }
      } catch (error) {
        console.error('AdSense 광고 로드 실패:', error);
      }
    };

    // DOM이 완전히 렌더링된 후 광고 로드
    const timer = setTimeout(loadAd, 300);

    return () => {
      clearTimeout(timer);
      // 컴포넌트 언마운트 시 정리
      if (adRef.current) {
        const insElement = adRef.current;
        // 광고 상태 초기화
        insElement.removeAttribute('data-adsbygoogle-status');
        insElement.innerHTML = '';
      }
    };
  }, [adSlot, isLoaded]);

  return (
    <div ref={containerRef} className={`adsense-container ${className}`} style={{ minHeight: '50px', minWidth: '300px', width: '100%' }}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ ...style, minWidth: '300px', minHeight: '50px' }}
        data-ad-client={import.meta.env.VITE_ADSENSE_CLIENT_ID || "ca-pub-0000000000000000"}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-ad-layout={adLayout}
        data-ad-layout-key={adLayoutKey}
        data-full-width-responsive="true"
      />
    </div>
  );
}

/**
 * 반응형 배너 광고 컴포넌트 (상단/하단용)
 */
export function ResponsiveBannerAd({ adSlot, className }: { adSlot: string; className?: string }) {
  return (
    <div className={`responsive-banner-wrapper ${className || ''}`}>
      <AdSense
        adSlot={adSlot}
        adFormat="auto"
        className="responsive-banner-ad"
        style={{ 
          display: 'block', 
          textAlign: 'center',
          maxWidth: '100%',
          height: 'auto',
          minHeight: '90px',
          maxHeight: '250px'
        }}
      />
    </div>
  );
}

/**
 * 사각형 광고 컴포넌트
 */
export function SquareAd({ adSlot, className }: { adSlot: string; className?: string }) {
  return (
    <AdSense
      adSlot={adSlot}
      adFormat="rectangle"
      className={className}
      style={{ display: 'inline-block', width: '300px', height: '250px' }}
    />
  );
}

/**
 * 세로형 광고 컴포넌트
 */
export function VerticalAd({ adSlot, className }: { adSlot: string; className?: string }) {
  return (
    <AdSense
      adSlot={adSlot}
      adFormat="vertical"
      className={className}
      style={{ display: 'inline-block', width: '160px', height: '600px' }}
    />
  );
}

/**
 * AdSense 유틸리티 함수들
 */
export const AdSenseUtils = {
  /**
   * 페이지 전환 시 광고 정리
   */
  clearAds: () => {
    if (typeof window !== 'undefined') {
      const adElements = document.querySelectorAll('.adsbygoogle');
      adElements.forEach((element) => {
        element.removeAttribute('data-adsbygoogle-status');
        element.innerHTML = '';
      });
    }
  },

  /**
   * AdSense 스크립트 로드 상태 확인
   */
  isAdSenseLoaded: () => {
    return typeof window !== 'undefined' && window.adsbygoogle !== undefined;
  },

  /**
   * 광고 새로고침 (SPA에서 페이지 전환 시 사용)
   */
  refreshAds: () => {
    if (typeof window !== 'undefined' && window.adsbygoogle) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (error) {
        console.error('AdSense 광고 새로고침 실패:', error);
      }
    }
  }
};

/**
 * React Router와 함께 사용할 수 있는 AdSense 훅
 */
export function useAdSense() {
  useEffect(() => {
    // 컴포넌트 언마운트 시 광고 정리
    return () => {
      AdSenseUtils.clearAds();
    };
  }, []);

  return {
    clearAds: AdSenseUtils.clearAds,
    refreshAds: AdSenseUtils.refreshAds,
    isLoaded: AdSenseUtils.isAdSenseLoaded()
  };
}