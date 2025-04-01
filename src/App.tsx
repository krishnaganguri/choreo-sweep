
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Index from "./pages/Index";
import ChoresPage from "./pages/ChoresPage";
import GroceriesPage from "./pages/GroceriesPage";
import ExpensesPage from "./pages/ExpensesPage";
import RemindersPage from "./pages/RemindersPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  // Add debug information
  console.log('ProtectedRoute check:', { user, loading });
  
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    console.log('User not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  console.log('User authenticated, rendering protected content');
  return <>{children}</>;
};

// App with AuthProvider
const AppWithAuth = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          
          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/chores" element={<ProtectedRoute><ChoresPage /></ProtectedRoute>} />
          <Route path="/groceries" element={<ProtectedRoute><GroceriesPage /></ProtectedRoute>} />
          <Route path="/expenses" element={<ProtectedRoute><ExpensesPage /></ProtectedRoute>} />
          <Route path="/reminders" element={<ProtectedRoute><RemindersPage /></ProtectedRoute>} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppWithAuth />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
