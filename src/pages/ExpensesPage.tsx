
import React, { useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import { Plus, PieChart, BarChart, BarChart3, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Expense {
  id: number;
  title: string;
  amount: number;
  category: string;
  date: string;
}

const ExpensesPage = () => {
  // Mock data - in a real app, this would come from state or API
  const [expenses] = useState<Expense[]>([
    { id: 1, title: "Groceries", amount: 87.95, category: "Food", date: "Apr 10" },
    { id: 2, title: "Electricity bill", amount: 120.50, category: "Utilities", date: "Apr 5" },
    { id: 3, title: "Internet", amount: 60.00, category: "Utilities", date: "Apr 3" },
    { id: 4, title: "Gas", amount: 45.00, category: "Transportation", date: "Apr 8" },
    { id: 5, title: "Restaurant", amount: 76.25, category: "Food", date: "Apr 7" },
    { id: 6, title: "Amazon", amount: 35.99, category: "Shopping", date: "Apr 6" },
    { id: 7, title: "Netflix", amount: 14.99, category: "Entertainment", date: "Apr 1" },
    { id: 8, title: "Pharmacy", amount: 22.50, category: "Health", date: "Apr 4" },
  ]);

  // Calculate totals
  const totalSpent = expenses.reduce((total, expense) => total + expense.amount, 0);
  
  // Group expenses by category
  const expensesByCategory = expenses.reduce((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = 0;
    }
    acc[expense.category] += expense.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-expenses">Expenses</h1>
            <p className="text-muted-foreground">
              Track your household spending
            </p>
          </div>
          <Button className="bg-expenses hover:bg-expenses/90">
            <Plus className="mr-2 h-4 w-4" /> Add Expense
          </Button>
        </div>

        <Card className="p-4">
          <h2 className="text-xl font-semibold">Total Spent</h2>
          <p className="text-3xl font-bold mt-1">${totalSpent.toFixed(2)}</p>
          <p className="text-sm text-muted-foreground">in April 2023</p>
        </Card>

        <Tabs defaultValue="recent">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          
          <TabsContent value="recent" className="mt-4 space-y-4">
            {expenses.map((expense) => (
              <div key={expense.id} className="card-container flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{expense.title}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {expense.date} • {expense.category}
                  </p>
                </div>
                <p className="font-semibold">${expense.amount.toFixed(2)}</p>
              </div>
            ))}
          </TabsContent>
          
          <TabsContent value="categories" className="mt-4">
            <Card className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <PieChart className="h-4 w-4 text-expenses" /> Expenses by Category
                </h3>
              </div>
              <Separator />
              <div className="space-y-3">
                {Object.entries(expensesByCategory).map(([category, amount]) => (
                  <div key={category} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-expenses"></div>
                      <span>{category}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${amount.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">
                        {Math.round((amount / totalSpent) * 100)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="reports" className="mt-4 grid gap-4">
            <Card className="p-4">
              <h3 className="font-semibold flex items-center gap-2">
                <BarChart className="h-4 w-4 text-expenses" /> Monthly Overview
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                View detailed reports and charts in the full version
              </p>
            </Card>
            
            <Card className="p-4">
              <h3 className="font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-expenses" /> Spending Trends
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Track your spending patterns over time
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default ExpensesPage;
