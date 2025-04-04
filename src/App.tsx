import { BrowserRouter } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/lib/auth";
import { FamilyProvider } from "@/lib/hooks/useFamily";
import { Router } from "@/Router";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { PrivacyNotice } from "@/components/PrivacyNotice";
import { Suspense } from "react";

const GOOGLE_ANALYTICS_ID = import.meta.env.VITE_GOOGLE_ANALYTICS_ID;

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
  );
}

export default App;
