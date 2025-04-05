import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ClipboardList, ShoppingCart, DollarSign, Bell, User, Users } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { choresService, groceriesService, expensesService, remindersService } from "@/lib/services";
import { useToast } from "@/components/ui/use-toast";
import DashboardCard from "@/components/dashboard/DashboardCard";
import { useQuery } from "@tanstack/react-query";
import { useFamily } from "@/lib/hooks/useFamily";

interface DashboardStats {
  chores: number;
  groceries: number;
  expenses: number;
  reminders: number;
}

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { currentFamily } = useFamily();

  // Get user's first name for greeting
  const firstName = user?.email ? user.email.split('@')[0] : 'there';

  // Get the appropriate view description
  const getViewDescription = () => {
    if (currentFamily === undefined) {
      return "Here's what's happening across all your families";
    } else if (currentFamily === null) {
      return "Here are your personal items";
    } else {
      return `Here's what's happening in ${currentFamily.name}`;
    }
  };

  // Query for fetching dashboard stats
  const { data: stats = { chores: 0, groceries: 0, expenses: 0, reminders: 0 }, isLoading } = useQuery({
    queryKey: ['dashboardStats', currentFamily?.id ?? (currentFamily === null ? 'personal' : 'all')],
    queryFn: async () => {
      try {
        const [chores, groceries, expenses, reminders] = await Promise.all([
          choresService.getChores(currentFamily),
          groceriesService.getGroceryItems(currentFamily?.id),
          expensesService.getExpenses(currentFamily?.id),
          remindersService.getReminders(currentFamily?.id),
        ]);

        return {
          chores: chores.filter(c => !c.completed && c.status === 'pending').length,
          groceries: groceries.filter(g => !g.completed).length,
          expenses: expenses.filter(e => !e.is_completed).length,
          reminders: reminders.filter(r => !r.completed && new Date(r.date) >= new Date()).length,
        };
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        });
        return { chores: 0, groceries: 0, expenses: 0, reminders: 0 };
      }
    },
    staleTime: 1000 * 30, // Consider data fresh for 30 seconds
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const dashboardItems = [
    {
      title: "Chores",
      description: "Track and manage household tasks",
      icon: <ClipboardList className="h-6 w-6" />,
      count: stats.chores,
      color: "text-blue-500",
      path: "/chores"
    },
    {
      title: "Groceries",
      description: "Create and manage shopping lists",
      icon: <ShoppingCart className="h-6 w-6" />,
      count: stats.groceries,
      color: "text-green-500",
      path: "/groceries"
    },
    {
      title: "Expenses",
      description: "Track and manage expenses",
      icon: <DollarSign className="h-6 w-6" />,
      count: stats.expenses,
      color: "text-yellow-500",
      path: "/expenses"
    },
    {
      title: "Reminders",
      description: "Set and manage reminders",
      icon: <Bell className="h-6 w-6" />,
      count: stats.reminders,
      color: "text-purple-500",
      path: "/reminders"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {firstName}!</h1>
        <p className="text-muted-foreground">
          {getViewDescription()}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dashboardItems.map((item) => (
          <DashboardCard
            key={item.title}
            title={item.title}
            description={item.description}
            icon={item.icon}
            count={item.count}
            color={item.color}
            onClick={() => navigate(item.path)}
          />
        ))}
      </div>
    </div>
  );
};

export default DashboardPage; 