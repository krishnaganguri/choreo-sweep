# Monitoring Guide

## Error Tracking with Sentry

### Setup
1. Install Sentry packages:
```bash
npm install @sentry/react @sentry/tracing
```

2. Create `src/lib/sentry.ts`:
```typescript
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [new BrowserTracing()],
  tracesSampleRate: 1.0,
  environment: import.meta.env.MODE,
  release: import.meta.env.VITE_APP_VERSION,
  beforeSend(event) {
    // Filter out sensitive data
    if (event.request?.data) {
      delete event.request.data.password;
      delete event.request.data.token;
    }
    return event;
  },
});
```

3. Add to `.env`:
```env
VITE_SENTRY_DSN=your_sentry_dsn
VITE_APP_VERSION=1.0.0
```

### Usage
```typescript
// Manual error reporting
Sentry.captureException(error);

// Custom error boundary
<Sentry.ErrorBoundary fallback={<ErrorFallback />}>
  <YourComponent />
</Sentry.ErrorBoundary>

// Performance monitoring
Sentry.startTransaction({ name: "YourTransaction" });
```

## Performance Monitoring with Web Vitals

### Setup
1. Install web-vitals:
```bash
npm install web-vitals
```

2. Create `src/lib/web-vitals.ts`:
```typescript
import { getCLS, getFID, getLCP, getFCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  const body = JSON.stringify(metric);
  // Send to your analytics endpoint
  fetch('/api/analytics', {
    body,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export function reportWebVitals() {
  getCLS(sendToAnalytics);
  getFID(sendToAnalytics);
  getLCP(sendToAnalytics);
  getFCP(sendToAnalytics);
  getTTFB(sendToAnalytics);
}
```

3. Add to `src/main.tsx`:
```typescript
import { reportWebVitals } from './lib/web-vitals';

// ... other imports

reportWebVitals();
```

## Analytics with Google Analytics 4

### Setup
1. Install GA4 package:
```bash
npm install gtag.js
```

2. Create `src/lib/analytics.ts`:
```typescript
export const GA_TRACKING_ID = import.meta.env.VITE_GA_TRACKING_ID;

// Initialize GA4
export const initGA = () => {
  window.gtag('config', GA_TRACKING_ID, {
    page_path: window.location.pathname,
    send_page_view: false,
  });
};

// Track page views
export const trackPageView = (url: string) => {
  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
  });
};

// Track events
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// Track errors
export const trackError = (error: Error) => {
  window.gtag('event', 'exception', {
    description: error.message,
    fatal: false,
  });
};
```

3. Add to `.env`:
```env
VITE_GA_TRACKING_ID=your_ga_tracking_id
```

4. Add to `index.html`:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=YOUR-GA-ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'YOUR-GA-ID');
</script>
```

## Integration with React Router

Add to `src/Router.tsx`:
```typescript
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '@/lib/analytics';

export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location]);
}

// Use in your router component
function Router() {
  usePageTracking();
  // ... rest of your router code
}
```

## Custom Performance Monitoring

Create `src/lib/performance.ts`:
```typescript
interface PerformanceMetrics {
  loadTime: number;
  firstPaint: number;
  firstContentfulPaint: number;
  domContentLoaded: number;
  networkRequests: number;
  memoryUsage?: number;
}

export const measurePerformance = (): PerformanceMetrics => {
  const timing = window.performance.timing;
  const navigation = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  
  return {
    loadTime: timing.loadEventEnd - timing.navigationStart,
    firstPaint: timing.domLoading - timing.navigationStart,
    firstContentfulPaint: timing.domContentLoadedEventEnd - timing.navigationStart,
    domContentLoaded: timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart,
    networkRequests: window.performance.getEntriesByType('resource').length,
    memoryUsage: (window.performance as any).memory?.usedJSHeapSize,
  };
};

export const logPerformanceMetrics = () => {
  const metrics = measurePerformance();
  console.log('Performance Metrics:', metrics);
  
  // Send to analytics
  Object.entries(metrics).forEach(([key, value]) => {
    if (value !== undefined) {
      trackEvent('performance_metric', key, undefined, value);
    }
  });
};
```

## Error Boundary Component

Create `src/components/ErrorBoundary.tsx`:
```typescript
import React from 'react';
import * as Sentry from '@sentry/react';
import { trackError } from '@/lib/analytics';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Sentry.captureException(error, { extra: errorInfo });
    trackError(error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <button onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Usage Examples

### Tracking User Actions
```typescript
import { trackEvent } from '@/lib/analytics';

// Track button clicks
const handleClick = () => {
  trackEvent('button_click', 'navigation', 'home_button');
};

// Track form submissions
const handleSubmit = (data: FormData) => {
  trackEvent('form_submit', 'authentication', 'signup_form');
};

// Track feature usage
const handleFeatureUse = () => {
  trackEvent('feature_use', 'chores', 'create_chore');
};
```

### Performance Monitoring
```typescript
import { logPerformanceMetrics } from '@/lib/performance';

// Log performance metrics on page load
useEffect(() => {
  logPerformanceMetrics();
}, []);

// Monitor specific operations
const measureOperation = async () => {
  const startTime = performance.now();
  await performOperation();
  const duration = performance.now() - startTime;
  trackEvent('operation_duration', 'performance', undefined, duration);
};
```

## Dashboard Setup

1. **Sentry Dashboard**
   - Configure error alerts
   - Set up release tracking
   - Create custom dashboards
   - Configure issue assignment

2. **Google Analytics Dashboard**
   - Set up custom events
   - Create user flow reports
   - Configure conversion tracking
   - Set up custom dimensions

3. **Performance Dashboard**
   - Monitor Core Web Vitals
   - Track custom metrics
   - Set up performance alerts
   - Create trend reports

## Best Practices

1. **Error Tracking**
   - Filter sensitive data
   - Group similar errors
   - Set up error alerts
   - Track error rates

2. **Performance Monitoring**
   - Monitor Core Web Vitals
   - Track custom metrics
   - Set performance budgets
   - Monitor third-party scripts

3. **Analytics**
   - Track user journeys
   - Monitor feature adoption
   - Track conversion rates
   - Analyze user behavior

4. **Privacy**
   - Anonymize user data
   - Respect user preferences
   - Comply with GDPR
   - Document data collection 