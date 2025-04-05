import React, { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Plus, PieChart, BarChart as BarChartIcon, Calendar, Trash2, TrendingUp, DollarSign, ArrowUpDown, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { expensesService } from "@/lib/services";
import { useFamily } from "@/lib/hooks/useFamily";
import { useSortableList } from "@/lib/hooks/useSortableList";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { Expense } from "@/lib/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const ExpensesPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>("other");
  const [date, setDate] = useState("");
  const [isPersonal, setIsPersonal] = useState(false);
  const { toast } = useToast();
  const { currentFamily } = useFamily();
  const { sortConfig, handleSort, getSortedItems } = useSortableList<'date' | 'amount' | 'category'>('date');
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const queryClient = useQueryClient();

  // Query for fetching expenses
  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses', currentFamily?.id],
    queryFn: () => expensesService.getExpenses(currentFamily?.id),
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });

  // Mutation for adding expenses
  const addExpenseMutation = useMutation({
    mutationFn: expensesService.addExpense,
    onSuccess: (newExpense) => {
      queryClient.setQueryData(['expenses', currentFamily?.id], (old: Expense[] = []) => [newExpense, ...old]);
      queryClient.invalidateQueries({ 
        queryKey: ['dashboardStats', currentFamily?.id ?? (currentFamily === null ? 'personal' : 'all')],
      });
      setShowForm(false);
      resetForm();
      toast({
        title: "Success",
        description: "Expense added successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add expense. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation for updating expenses
  const updateExpenseMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<Expense> }) => 
      expensesService.updateExpense(id, updates),
    onSuccess: (updatedExpense) => {
      queryClient.setQueryData(['expenses', currentFamily?.id], (old: Expense[] = []) => 
        old.map(exp => exp.id === updatedExpense.id ? updatedExpense : exp)
      );
      queryClient.invalidateQueries({ 
        queryKey: ['dashboardStats', currentFamily?.id ?? (currentFamily === null ? 'personal' : 'all')],
      });
      setShowForm(false);
      resetForm();
      toast({
        title: "Success",
        description: "Expense updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update expense. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation for deleting expenses
  const deleteExpenseMutation = useMutation({
    mutationFn: expensesService.deleteExpense,
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData(['expenses', currentFamily?.id], (old: Expense[] = []) => 
        old.filter(exp => exp.id !== deletedId)
      );
      queryClient.invalidateQueries({ 
        queryKey: ['dashboardStats', currentFamily?.id ?? (currentFamily === null ? 'personal' : 'all')],
      });
      toast({
        title: "Success",
        description: "Expense deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete expense. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || !date) return;

    addExpenseMutation.mutate({
      title,
      amount: parseFloat(amount),
      category,
      date,
      is_personal: isPersonal,
      family_id: !isPersonal ? currentFamily?.id : undefined
    });
  };

  const handleEditExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense || !title || !amount || !date) return;

    updateExpenseMutation.mutate({
      id: editingExpense.id,
      updates: {
        title,
        amount: parseFloat(amount),
        category,
        date,
        is_personal: isPersonal,
        family_id: !isPersonal ? currentFamily?.id : undefined
      }
    });
  };

  const startEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setTitle(expense.title);
    setAmount(expense.amount.toString());
    setCategory(expense.category);
    setDate(expense.date);
    setIsPersonal(!expense.family_id);
    setShowForm(true);
  };

  const resetForm = () => {
    setTitle("");
    setAmount("");
    setCategory("other");
    setDate("");
    setIsPersonal(false);
    setEditingExpense(null);
  };

  const deleteExpense = async (id: number) => {
    deleteExpenseMutation.mutate(id);
  };

  // Calculate totals and prepare data for reports
  const totalSpent = expenses.reduce((total, expense) => total + expense.amount, 0);
  
  // Group expenses by category
  const expensesByCategory = expenses.reduce((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = 0;
    }
    acc[expense.category] += expense.amount;
    return acc;
  }, {} as Record<string, number>);

  // Prepare monthly overview data
  const currentMonth = format(new Date(), 'MMMM yyyy');
  const startOfCurrentMonth = startOfMonth(new Date());
  const endOfCurrentMonth = endOfMonth(new Date());

  const monthlyExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= startOfCurrentMonth && expenseDate <= endOfCurrentMonth;
  });

  const monthlyTotal = monthlyExpenses.reduce((total, expense) => total + expense.amount, 0);
  const monthlyAverage = monthlyTotal / (monthlyExpenses.length || 1);

  // Prepare spending trends data (last 6 months)
  const trendData = Array.from({ length: 6 }, (_, i) => {
    const monthStart = startOfMonth(subMonths(new Date(), i));
    const monthEnd = endOfMonth(subMonths(new Date(), i));
    const monthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= monthStart && expenseDate <= monthEnd;
    });
    const total = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    return {
      month: format(monthStart, 'MMM'),
      total,
    };
  }).reverse();

  const categories = [
    "groceries",
    "utilities",
    "rent",
    "entertainment",
    "transportation",
    "healthcare",
    "education",
    "shopping",
    "other"
  ];

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading expenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-expenses">Expenses</h1>
            <p className="text-muted-foreground">
            {currentFamily ? `Manage ${currentFamily.name}'s expenses` : 'Manage your expenses'}
            </p>
          </div>
        <Dialog open={showForm} onOpenChange={(open) => {
          setShowForm(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
          <Button className="bg-expenses hover:bg-expenses/90">
            <Plus className="mr-2 h-4 w-4" /> Add Expense
          </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingExpense ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={editingExpense ? handleEditExpense : handleAddExpense} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {currentFamily && (
                <div className="flex items-center space-x-2">
                  <Switch
                    id="personal"
                    checked={isPersonal}
                    onCheckedChange={setIsPersonal}
                  />
                  <Label htmlFor="personal">Make this a personal expense</Label>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-expenses hover:bg-expenses/90">
                  {editingExpense ? 'Update' : 'Add'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 overflow-x-auto py-2">
        <Button 
          variant="outline" 
          className={`flex gap-1 whitespace-nowrap ${sortConfig.sortBy === 'date' ? 'bg-secondary' : ''}`}
          onClick={() => handleSort('date')}
        >
          <ArrowUpDown className="h-4 w-4" /> 
          Date {sortConfig.sortBy === 'date' && (sortConfig.sortOrder === 'asc' ? '↑' : '↓')}
        </Button>
        <Button 
          variant="outline" 
          className={`flex gap-1 whitespace-nowrap ${sortConfig.sortBy === 'amount' ? 'bg-secondary' : ''}`}
          onClick={() => handleSort('amount')}
        >
          <ArrowUpDown className="h-4 w-4" /> 
          Amount {sortConfig.sortBy === 'amount' && (sortConfig.sortOrder === 'asc' ? '↑' : '↓')}
        </Button>
        <Button 
          variant="outline" 
          className={`flex gap-1 whitespace-nowrap ${sortConfig.sortBy === 'category' ? 'bg-secondary' : ''}`}
          onClick={() => handleSort('category')}
        >
          <ArrowUpDown className="h-4 w-4" /> 
          Category {sortConfig.sortBy === 'category' && (sortConfig.sortOrder === 'asc' ? '↑' : '↓')}
        </Button>
      </div>

      <div className="space-y-3">
        {expenses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No expenses yet. Add your first expense to get started!
          </div>
        ) : (
          getSortedItems(expenses, undefined, (a, b, sortBy, sortOrder) => {
            switch (sortBy) {
              case 'date':
                const dateA = new Date(a.date).getTime();
                const dateB = new Date(b.date).getTime();
                return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
              case 'amount':
                return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
              case 'category':
                return sortOrder === 'asc'
                  ? a.category.localeCompare(b.category)
                  : b.category.localeCompare(a.category);
              default:
                return 0;
            }
          }).map((expense) => (
            <div
              key={expense.id}
              className="card-container flex items-center gap-3"
            >
              <div className="flex-1">
                <div className="font-medium">{expense.title}</div>
                <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                  <span className="bg-secondary px-2 py-0.5 rounded-full">
                    ${expense.amount.toFixed(2)}
                  </span>
                  <span className="bg-secondary px-2 py-0.5 rounded-full">
                    {new Date(expense.date).toLocaleDateString()}
                  </span>
                  <span className="bg-secondary px-2 py-0.5 rounded-full">
                    {expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}
                  </span>
                  {currentFamily && (
                    <span className="bg-secondary px-2 py-0.5 rounded-full">
                      {expense.family_id ? 'Family' : 'Personal'}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => startEdit(expense)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteExpense(expense.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
        </div>

        <Card className="p-4">
          <h2 className="text-xl font-semibold">Total Spent</h2>
          <p className="text-3xl font-bold mt-1">${totalSpent.toFixed(2)}</p>
        <p className="text-sm text-muted-foreground">
          {currentMonth}
        </p>
        </Card>

        <Tabs defaultValue="recent">
        <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Overview</TabsTrigger>
          <TabsTrigger value="trends">Spending Trends</TabsTrigger>
          </TabsList>
          
          <TabsContent value="recent" className="mt-4 space-y-4">
          {expenses.length === 0 ? (
            <Card className="p-6 text-center">
              <DollarSign className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-3" />
              <h3 className="font-medium text-lg">No expenses yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Add your first expense to start tracking
              </p>
            </Card>
          ) : (
            getSortedItems(expenses, undefined, (a, b, sortBy, sortOrder) => {
              switch (sortBy) {
                case 'date':
                  const dateA = new Date(a.date).getTime();
                  const dateB = new Date(b.date).getTime();
                  return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
                case 'amount':
                  return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
                case 'category':
                  return sortOrder === 'asc'
                    ? a.category.localeCompare(b.category)
                    : b.category.localeCompare(a.category);
                default:
                  return 0;
              }
            }).map((expense) => (
              <Card key={expense.id} className="p-4">
                <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{expense.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {expense.category} • {new Date(expense.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium">${expense.amount.toFixed(2)}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteExpense(expense.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
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
          
        <TabsContent value="monthly" className="mt-4">
          <Card className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-expenses" /> Monthly Overview
              </h3>
            </div>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold">${monthlyTotal.toFixed(2)}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Average per Expense</p>
                <p className="text-2xl font-bold">${monthlyAverage.toFixed(2)}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Number of Expenses</p>
                <p className="text-2xl font-bold">{monthlyExpenses.length}</p>
              </div>
            </div>
            <div className="h-[300px] mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyExpenses.map(expense => ({
                  name: expense.title,
                  amount: expense.amount
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="amount" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            </Card>
        </TabsContent>
            
        <TabsContent value="trends" className="mt-4">
          <Card className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-expenses" /> Spending Trends
              </h3>
            </div>
            <Separator />
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    dot={{ fill: "#f59e0b" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  );
};

export default ExpensesPage;
