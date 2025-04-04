import { onCLS, onFID, onLCP, onFCP, onTTFB } from 'web-vitals';

const sendToAnalytics = (metric: any) => {
  // In production, send to analytics
  if (process.env.NODE_ENV === 'production') {
    // Send to your analytics service
    console.log(metric);
  } else {
    // In development, log to console
    console.log(metric);
  }
};

export function reportWebVitals() {
  if (typeof window !== 'undefined') {
    onCLS(sendToAnalytics);
    onFID(sendToAnalytics);
    onLCP(sendToAnalytics);
    onFCP(sendToAnalytics);
    onTTFB(sendToAnalytics);
  }
} 