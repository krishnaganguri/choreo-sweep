
import React from "react";
import AppLayout from "../components/layout/AppLayout";
import DashboardCard from "../components/dashboard/DashboardCard";
import HouseholdStats from "../components/dashboard/HouseholdStats";
import RecentActivities from "../components/dashboard/RecentActivities";
import UpcomingTasks from "../components/dashboard/UpcomingTasks";
import { ClipboardList, ShoppingCart, DollarSign, Bell, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Index = () => {
  // Mock data - in a real app, this would come from state or API
  const mockData = {
    chores: 4,
    groceries: 12,
    expenses: 8,
    reminders: 3
  };

  const { user } = useAuth();
  
  // Get user's first name for greeting
  const firstName = user?.email ? user.email.split('@')[0] : 'there';

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center">
            <h1 className="text-3xl font-bold tracking-tight">
              Hello, {firstName}
            </h1>
            <div className="ml-auto flex items-center bg-primary/10 p-2 rounded-full">
              <User className="h-5 w-5 text-primary" />
            </div>
          </div>
          <p className="text-muted-foreground">
            Welcome to your HomeSync dashboard. Here's what's happening today.
          </p>
        </div>
        
        <HouseholdStats />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DashboardCard
            title="Chores"
            description="Track and manage household tasks"
            path="/chores"
            icon={<ClipboardList className="h-5 w-5" />}
            color="border-chores"
            count={mockData.chores}
          />
          
          <DashboardCard
            title="Groceries"
            description="Create and manage shopping lists"
            path="/groceries"
            icon={<ShoppingCart className="h-5 w-5" />}
            color="border-groceries"
            count={mockData.groceries}
          />
          
          <DashboardCard
            title="Expenses"
            description="Track household spending"
            path="/expenses"
            icon={<DollarSign className="h-5 w-5" />}
            color="border-expenses"
            count={mockData.expenses}
          />
          
          <DashboardCard
            title="Reminders"
            description="Set alerts for important dates"
            path="/reminders"
            icon={<Bell className="h-5 w-5" />}
            color="border-reminders"
            count={mockData.reminders}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RecentActivities />
          <UpcomingTasks />
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
