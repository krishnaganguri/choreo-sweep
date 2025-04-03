import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ClipboardList, ShoppingCart, DollarSign, Bell, User } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { choresService, groceriesService, expensesService, remindersService } from "@/lib/services";
import { useToast } from "@/components/ui/use-toast";
import DashboardCard from "@/components/dashboard/DashboardCard";

interface DashboardCounts {
  chores: number;
  groceries: number;
  expenses: number;
  reminders: number;
  loading: boolean;
}

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [counts, setCounts] = useState<DashboardCounts>({
    chores: 0,
    groceries: 0,
    expenses: 0,
    reminders: 0,
    loading: true,
  });

  // Get user's first name for greeting
  const firstName = user?.email ? user.email.split('@')[0] : 'there';

  useEffect(() => {
    loadCounts();
  }, []);

  const loadCounts = async () => {
    try {
      const [chores, groceries, expenses, reminders] = await Promise.all([
        choresService.getChores(),
        groceriesService.getGroceryItems(),
        expensesService.getExpenses(),
        remindersService.getReminders(),
      ]);

      setCounts({
        chores: chores.filter(c => c.status !== 'completed').length,
        groceries: groceries.filter(g => !g.completed).length,
        expenses: expenses.length,
        reminders: reminders.filter(r => !r.completed).length,
        loading: false,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });
      setCounts(prev => ({ ...prev, loading: false }));
    }
  };

  const dashboardItems = [
    {
      title: "Chores",
      description: "Track and manage household tasks",
      icon: <ClipboardList className="h-6 w-6" />,
      path: "/chores",
      color: "border-chores",
      count: counts.chores,
    },
    {
      title: "Groceries",
      description: "Create and manage shopping lists",
      icon: <ShoppingCart className="h-6 w-6" />,
      path: "/groceries",
      color: "border-groceries",
      count: counts.groceries,
    },
    {
      title: "Expenses",
      description: "Track household spending",
      icon: <DollarSign className="h-6 w-6" />,
      path: "/expenses",
      color: "border-expenses",
      count: counts.expenses,
    },
    {
      title: "Reminders",
      description: "Set alerts for important dates",
      icon: <Bell className="h-6 w-6" />,
      path: "/reminders",
      color: "border-reminders",
      count: counts.reminders,
    },
  ];

  if (counts.loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 mb-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            {user ? `Welcome to ${user.email.split('@')[0]}'s dashboard` : 'Welcome to your dashboard'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dashboardItems.map((item) => (
          <DashboardCard
            key={item.path}
            title={item.title}
            description={item.description}
            path={item.path}
            icon={item.icon}
            color={item.color}
            count={item.count}
          />
        ))}
      </div>
    </div>
  );
};

export default DashboardPage; 