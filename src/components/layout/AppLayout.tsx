
import React from "react";
import { useLocation, Link } from "react-router-dom";
import { Home, ClipboardList, ShoppingCart, DollarSign, Bell, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { signOut } = useAuth();
  
  const navItems = [
    { path: "/", label: "Home", icon: <Home className="h-6 w-6" /> },
    { path: "/chores", label: "Chores", icon: <ClipboardList className="h-6 w-6" /> },
    { path: "/groceries", label: "Groceries", icon: <ShoppingCart className="h-6 w-6" /> },
    { path: "/expenses", label: "Expenses", icon: <DollarSign className="h-6 w-6" /> },
    { path: "/reminders", label: "Reminders", icon: <Bell className="h-6 w-6" /> },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("Error signing out");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 pb-16">
        <div className="app-container py-4 px-4 md:px-6">
          {children}
        </div>
      </main>
      
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border h-16">
        <div className="grid h-full grid-cols-6 mx-auto max-w-lg">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center space-y-1 text-xs ${
                currentPath === item.path 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center justify-center h-6 w-6">
                {item.icon}
              </div>
              <span>{item.label}</span>
            </Link>
          ))}
          <button
            onClick={handleSignOut}
            className="flex flex-col items-center justify-center space-y-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <div className="flex items-center justify-center h-6 w-6">
              <LogOut className="h-6 w-6" />
            </div>
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default AppLayout;
