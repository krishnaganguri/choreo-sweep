import { onCLS, onFID, onLCP, onFCP, onTTFB, type Metric } from 'web-vitals';

function sendToAnalytics(metric: Metric) {
  const body = JSON.stringify(metric);
  // Send to your analytics endpoint
  if (import.meta.env.PROD) {
    fetch('/api/analytics', {
      body,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } else {
    console.log('Web Vitals:', metric);
  }
}

export function reportWebVitals() {
  if (typeof window !== 'undefined') {
    onCLS(sendToAnalytics);
    onFID(sendToAnalytics);
    onLCP(sendToAnalytics);
    onFCP(sendToAnalytics);
    onTTFB(sendToAnalytics);
  }
} 