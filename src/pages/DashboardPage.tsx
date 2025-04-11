import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ClipboardList, ShoppingCart, DollarSign, Bell, User, Users } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { choresService, groceriesService, expensesService, remindersService } from "@/lib/services";
import { useToast } from "@/components/ui/use-toast";
import DashboardCard from "@/components/dashboard/DashboardCard";
import { useQuery } from "@tanstack/react-query";
import { useFamily } from "@/lib/hooks/useFamily";
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  const { family } = useFamily();
  const [viewType, setViewType] = useState<'all' | 'personal' | 'family'>('all');

  // Get user's first name for greeting
  const firstName = user?.email ? user.email.split('@')[0] : 'there';

  // Get the appropriate view description
  const getViewDescription = () => {
    switch (viewType) {
      case 'personal':
        return "Here are your personal items";
      case 'family':
        return family ? `Here's what's happening in ${family.name}` : "No family items to show";
      default:
        return "Here's everything at a glance";
    }
  };

  // Query for fetching dashboard stats
  const { data: stats = { chores: 0, groceries: 0, expenses: 0, reminders: 0 }, isLoading } = useQuery({
    queryKey: ['dashboardStats', viewType, family?.id],
    queryFn: async () => {
      try {
        let familyParam;
        if (viewType === 'personal') {
          familyParam = null;
        } else if (viewType === 'family') {
          familyParam = family;
        } else {
          familyParam = undefined;
        }

        const [chores, groceries, expenses, reminders] = await Promise.all([
          choresService.getChores(familyParam),
          groceriesService.getGroceryItems(family?.id),
          expensesService.getExpenses(family?.id),
          remindersService.getReminders(family?.id),
        ]);

        return {
          chores: chores.filter(c => !c.completed).length,
          groceries: groceries.filter(g => !g.purchased).length,
          expenses: expenses.length,
          reminders: reminders.filter(r => !r.completed).length,
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
  });

  // Define colors for the cards
  const cardColors = {
    chores: "bg-blue-50 border-blue-200 hover:bg-blue-100",
    groceries: "bg-green-50 border-green-200 hover:bg-green-100",
    expenses: "bg-yellow-50 border-yellow-200 hover:bg-yellow-100",
    reminders: "bg-purple-50 border-purple-200 hover:bg-purple-100",
  };

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
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Hi, {firstName}!</h1>
        <p className="text-muted-foreground">{getViewDescription()}</p>
      </div>

      <div className="flex justify-center">
        <Tabs 
          value={viewType} 
          onValueChange={(value) => setViewType(value as 'all' | 'personal' | 'family')} 
          className="w-full max-w-md"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="family">Family</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card 
          className={`p-4 cursor-pointer transition-colors ${cardColors.chores}`}
          onClick={() => navigate('/chores')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Chores</CardTitle>
            <ClipboardList className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{stats.chores}</div>
            <p className="text-xs text-blue-700">pending tasks</p>
          </CardContent>
        </Card>
        
        <Card 
           className={`p-4 cursor-pointer transition-colors ${cardColors.groceries}`}
           onClick={() => navigate('/groceries')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Groceries</CardTitle>
            <ShoppingCart className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{stats.groceries}</div>
            <p className="text-xs text-green-700">items needed</p>
          </CardContent>
        </Card>

        <Card 
           className={`p-4 cursor-pointer transition-colors ${cardColors.expenses}`}
           onClick={() => navigate('/expenses')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800">Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">{stats.expenses}</div>
            <p className="text-xs text-yellow-700">pending payments</p>
          </CardContent>
        </Card>

        <Card 
           className={`p-4 cursor-pointer transition-colors ${cardColors.reminders}`}
           onClick={() => navigate('/reminders')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Reminders</CardTitle>
            <Bell className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{stats.reminders}</div>
            <p className="text-xs text-purple-700">active reminders</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage; 