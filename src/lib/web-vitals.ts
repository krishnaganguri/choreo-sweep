type Metric = {
  id: string;
  name: string;
  value: number;
  delta?: number;
};

const sendToAnalytics = (metric: Metric) => {
  // In production, send to analytics
  if (import.meta.env.PROD) {
    // Send to your analytics service
    console.log(metric);
  } else {
    // In development, log to console
    console.log(metric);
  }
};

export async function reportWebVitals() {
  if (typeof window !== 'undefined') {
    try {
      const { onCLS, onFID, onLCP, onFCP, onTTFB } = await import('web-vitals');
      onCLS(sendToAnalytics);
      onFID(sendToAnalytics);
      onLCP(sendToAnalytics);
      onFCP(sendToAnalytics);
      onTTFB(sendToAnalytics);
    } catch (error) {
      console.error('Failed to load web-vitals:', error);
    }
  }
} 