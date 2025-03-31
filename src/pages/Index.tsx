
import React from "react";
import AppLayout from "../components/layout/AppLayout";
import DashboardCard from "../components/dashboard/DashboardCard";
import { ClipboardList, ShoppingCart, DollarSign, Bell } from "lucide-react";

const Index = () => {
  // Mock data - in a real app, this would come from state or API
  const mockData = {
    chores: 4,
    groceries: 12,
    expenses: 8,
    reminders: 3
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Home Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your household tasks and activities all in one place.
          </p>
        </div>
        
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
        
        <div className="card-container">
          <h2 className="font-semibold text-lg mb-2">Quick Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-secondary p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">Tasks completed</p>
              <p className="text-2xl font-bold">16</p>
            </div>
            <div className="bg-secondary p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">Upcoming tasks</p>
              <p className="text-2xl font-bold">7</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
