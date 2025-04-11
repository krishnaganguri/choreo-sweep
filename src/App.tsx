import { BrowserRouter } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/lib/hooks/useAuth";
import { FamilyProvider } from "@/lib/hooks/useFamily";
import { Router } from "@/Router";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { PrivacyNotice } from "@/components/PrivacyNotice";
import { Suspense } from "react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const GOOGLE_ANALYTICS_ID = import.meta.env.VITE_GOOGLE_ANALYTICS_ID;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 1,
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
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <QueryClientProvider client={queryClient}>
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
        </QueryClientProvider>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
