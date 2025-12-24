/**
 * 구글 애드센스 스크립트 로더
 */

import { useEffect } from 'react';

interface AdSenseScriptProps {
  clientId?: string;
}

export function AdSenseScript({ 
  clientId = import.meta.env.VITE_ADSENSE_CLIENT_ID 
}: AdSenseScriptProps) {
  useEffect(() => {
    // 이미 스크립트가 로드되었는지 확인
    if (document.querySelector('script[src*="adsbygoogle.js"]')) {
      return;
    }

    // 애드센스 스크립트 동적 로드
    const script = document.createElement('script');
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
    script.async = true;
    script.crossOrigin = 'anonymous';
    
    // 스크립트 로드 완료 처리
    script.onload = () => {
      console.log('AdSense 스크립트 로드 완료');
    };
    
    script.onerror = () => {
      console.error('AdSense 스크립트 로드 실패');
    };

    document.head.appendChild(script);

    // 컴포넌트 언마운트 시 정리
    return () => {
      const existingScript = document.querySelector('script[src*="adsbygoogle.js"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [clientId]);

  return null; // 렌더링할 내용 없음
}