import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, CheckSquare, ShoppingCart, DollarSign, Bell, Users } from "lucide-react";
import { ProfileDropdown } from "./ProfileDropdown";

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Chores", href: "/chores", icon: CheckSquare },
    { name: "Groceries", href: "/groceries", icon: ShoppingCart },
    { name: "Expenses", href: "/expenses", icon: DollarSign },
    { name: "Reminders", href: "/reminders", icon: Bell },
    { name: "Family", href: "/family", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-16 items-center gap-4 border-b px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="text-xl">🏠</span>
          <span className="hidden md:inline">Home Manager</span>
        </Link>
        <nav className="flex-1">
          <ul className="flex gap-4 md:gap-6">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium",
                    location.pathname === item.href
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="hidden md:inline">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto">
          <ProfileDropdown />
        </div>
      </div>
      <main>{children}</main>
    </div>
  );
}; 