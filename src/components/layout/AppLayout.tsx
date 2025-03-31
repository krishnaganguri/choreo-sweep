
import React from "react";
import { useLocation, Link } from "react-router-dom";
import { Home, ClipboardList, ShoppingCart, DollarSign, Bell } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  const navItems = [
    { path: "/", label: "Home", icon: <Home className="h-6 w-6" /> },
    { path: "/chores", label: "Chores", icon: <ClipboardList className="h-6 w-6" /> },
    { path: "/groceries", label: "Groceries", icon: <ShoppingCart className="h-6 w-6" /> },
    { path: "/expenses", label: "Expenses", icon: <DollarSign className="h-6 w-6" /> },
    { path: "/reminders", label: "Reminders", icon: <Bell className="h-6 w-6" /> },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 pb-16">
        <div className="app-container py-4">
          {children}
        </div>
      </main>
      
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border h-16">
        <div className="grid h-full grid-cols-5 mx-auto max-w-lg">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${currentPath === item.path ? "active" : ""}`}
            >
              <div className="flex items-center justify-center h-10 w-10 my-1">
                {item.icon}
              </div>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default AppLayout;
