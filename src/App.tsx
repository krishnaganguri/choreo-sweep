import { BrowserRouter } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/lib/auth";
import { FamilyProvider } from "@/lib/hooks/useFamily";
import { Router } from "@/Router";
import { HelmetProvider } from 'react-helmet-async';
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { PrivacyNotice } from "@/components/PrivacyNotice";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense } from "react";

const GOOGLE_ANALYTICS_ID = import.meta.env.VITE_GOOGLE_ANALYTICS_ID;

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function LoadingFallback() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <Suspense fallback={<LoadingFallback />}>
            <BrowserRouter>
              <AuthProvider>
                <FamilyProvider>
                  <Router />
                  <Toaster />
                  {GOOGLE_ANALYTICS_ID && (
                    <GoogleAnalytics measurementId={GOOGLE_ANALYTICS_ID} />
                  )}
                  <PrivacyNotice />
                </FamilyProvider>
              </AuthProvider>
            </BrowserRouter>
          </Suspense>
        </HelmetProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
