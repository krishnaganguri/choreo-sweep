import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    gtag: (
      type: string,
      action: string,
      params: {
        page_path?: string;
        [key: string]: any;
      }
    ) => void;
  }
}

export function GoogleAnalytics({ measurementId }: { measurementId: string }) {
  const location = useLocation();

  useEffect(() => {
    // Load Google Analytics Script
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    script.async = true;
    document.head.appendChild(script);

    // Initialize Google Analytics
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    gtag('js', new Date());
    gtag('config', measurementId);

    return () => {
      // Cleanup
      document.head.removeChild(script);
    };
  }, [measurementId]);

  useEffect(() => {
    // Track page views
    window.gtag?.('config', measurementId, {
      page_path: location.pathname + location.search,
    });
  }, [location, measurementId]);

  return null;
} 