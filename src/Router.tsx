import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import AppLayout from "@/components/layout/AppLayout";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import ChoresPage from "@/pages/ChoresPage";
import GroceriesPage from "@/pages/GroceriesPage";
import ExpensesPage from "@/pages/ExpensesPage";
import RemindersPage from "@/pages/RemindersPage";
import { FamilyPage } from "@/pages/FamilyPage";
import ProfilePage from "@/pages/ProfilePage";

// Protected Layout component that includes AppLayout
const ProtectedLayout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

// Public route wrapper
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Layout wrapper that includes AppLayout
const AppLayoutWrapper = () => {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
};

export function Router() {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* Protected routes */}
      <Route element={<ProtectedLayout />}>
        <Route element={<AppLayoutWrapper />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/chores" element={<ChoresPage />} />
          <Route path="/groceries" element={<GroceriesPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/reminders" element={<RemindersPage />} />
          <Route path="/family" element={<FamilyPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>
    </Routes>
  );
} 