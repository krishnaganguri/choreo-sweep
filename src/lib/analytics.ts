// Declare gtag as a global function
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (type: string, action: string, params: { [key: string]: any; page_path?: string; }) => void;
  }
}

export const GA_TRACKING_ID = import.meta.env.VITE_GA_TRACKING_ID;

// Initialize GA4
export const initGA = () => {
  try {
    if (typeof window.gtag !== 'function') {
      console.warn('Google Analytics not loaded yet');
      return;
    }

    window.gtag('config', GA_TRACKING_ID, {
      page_path: window.location.pathname,
      send_page_view: false,
    });
  } catch (error) {
    console.error('Error initializing Google Analytics:', error);
  }
};

// Track page views
export const trackPageView = (url: string) => {
  try {
    if (typeof window.gtag !== 'function') return;
    
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  } catch (error) {
    console.error('Error tracking page view:', error);
  }
};

// Track events
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  try {
    if (typeof window.gtag !== 'function') return;

    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  } catch (error) {
    console.error('Error tracking event:', error);
  }
};

// Track errors
export const trackError = (error: Error) => {
  try {
    if (typeof window.gtag !== 'function') return;

    window.gtag('event', 'exception', {
      description: error.message,
      fatal: false,
    });
  } catch (err) {
    console.error('Error tracking error:', err);
  }
}; 