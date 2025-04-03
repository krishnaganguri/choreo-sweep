import React from "react";
import { useLocation, Link } from "react-router-dom";
import { Home, ClipboardList, ShoppingCart, DollarSign, Bell, LogOut, Users } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";
import { NotificationPermission } from '@/components/NotificationPermission';
import { FamilySelector } from '@/components/FamilySelector';
import { ProfileMenu } from '@/components/ProfileMenu';
import { Button } from "@/components/ui/button";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { signOut } = useAuth();
  const { toast } = useToast();
  
  const navItems = [
    { path: "/", label: "Dashboard", icon: <Home className="h-6 w-6" /> },
    { path: "/chores", label: "Chores", icon: <ClipboardList className="h-6 w-6" /> },
    { path: "/groceries", label: "Groceries", icon: <ShoppingCart className="h-6 w-6" /> },
    { path: "/expenses", label: "Expenses", icon: <DollarSign className="h-6 w-6" /> },
    { path: "/reminders", label: "Reminders", icon: <Bell className="h-6 w-6" /> },
    { path: "/family", label: "Family", icon: <Users className="h-6 w-6" /> },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Success",
        description: "Signed out successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error signing out",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background z-50">
        <div className="container py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">MyHomeManager</h1>
          <div className="flex items-center gap-4">
            <FamilySelector />
            <ProfileMenu />
          </div>
        </div>
      </header>
      <main className="flex-1 pb-24">
        <div className="container py-4">
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
                (currentPath === item.path || (item.path === "/" && currentPath === "")) 
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
        </div>
      </nav>
      <NotificationPermission />
    </div>
  );
};

export default AppLayout;
