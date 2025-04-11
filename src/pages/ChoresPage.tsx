import React from "react";
import { Check, Plus, Repeat, CalendarClock, ArrowUpDown, Trash2, Users, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { choresService } from "@/lib/services";
import { getCurrentUserId } from "@/lib/services";
import { useFamily } from "@/lib/hooks/useFamily";
import { useSortableList } from "@/lib/hooks/useSortableList";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { Chore } from "@/lib/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";
import { familyService } from "@/lib/services";

interface SortConfig {
  key: 'dueDate';
  direction: 'asc' | 'desc';
}

const ChoresPage = () => {
  const [showForm, setShowForm] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [dueDate, setDueDate] = React.useState("");
  const [recurring, setRecurring] = React.useState(false);
  const [recurringInterval, setRecurringInterval] = React.useState<string>("");
  const [assignedTo, setAssignedTo] = React.useState<string | undefined>();
  const { toast } = useToast();
  const { family } = useFamily();
  const { sortConfig, handleSort, getSortedItems } = useSortableList<'dueDate'>('dueDate');
  const [editingChore, setEditingChore] = React.useState<Chore | null>(null);
  const queryClient = useQueryClient();
  const [currentUserId, setCurrentUserId] = React.useState<string>();

  React.useEffect(() => {
    const fetchUserId = async () => {
      const userId = await getCurrentUserId();
      setCurrentUserId(userId || undefined);
    };
    fetchUserId();
  }, []);

  // Query for fetching family members
  const { data: familyMembers = [] } = useQuery({
    queryKey: ['familyMembers', family?.id],
    queryFn: () => family?.id ? familyService.getFamilyMembers(family.id) : [],
    enabled: !!family?.id,
  });

  // Query for fetching chores
  const { data: chores = [], isLoading } = useQuery({
    queryKey: ['chores', family?.id],
    queryFn: () => choresService.getChores(family),
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });

  // Mutation for adding chores
  const addChoreMutation = useMutation({
    mutationFn: choresService.addChore,
    onSuccess: (newChore) => {
      const queryKey = ['chores', family?.id];
      queryClient.setQueryData(queryKey, (old: Chore[] = []) => [newChore, ...old]);
      queryClient.invalidateQueries({ 
        queryKey: ['dashboardStats', family?.id ?? 'all'],
      });
      setShowForm(false);
      resetForm();
      toast({
        title: "Success",
        description: "Chore added successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add chore. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation for updating chores
  const updateChoreMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Chore> }) => 
      choresService.updateChore(id, updates),
    onSuccess: (updatedChore) => {
      const queryKey = ['chores', family?.id];
      queryClient.setQueryData(queryKey, (old: Chore[] = []) => 
        old.map(c => c.id === updatedChore.id ? updatedChore : c)
      );
      queryClient.invalidateQueries({ 
        queryKey: ['dashboardStats', family?.id ?? 'all'],
      });
      setShowForm(false);
      resetForm();
      toast({
        title: "Success",
        description: "Chore updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update chore. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation for deleting chores
  const deleteChoreMutation = useMutation({
    mutationFn: choresService.deleteChore,
    onSuccess: (_, deletedId) => {
      const queryKey = ['chores', family?.id];
      queryClient.setQueryData(queryKey, (old: Chore[] = []) => 
        old.filter(c => c.id !== deletedId)
      );
      queryClient.invalidateQueries({ 
        queryKey: ['dashboardStats', family?.id ?? 'all'],
      });
      toast({
        title: "Success",
        description: "Chore deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete chore. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddChore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dueDate || !currentUserId || !family?.id) {
      toast({
        title: "Error",
        description: "Please select a family and fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    addChoreMutation.mutate({
      title,
      description,
      due_date: dueDate,
      completed: false,
      recurring,
      recurring_interval: recurring ? recurringInterval : undefined,
      family_id: family.id,
      assigned_to: assignedTo || currentUserId,
      created_by: currentUserId
    });
  };

  const handleEditChore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChore || !title || !dueDate || !family?.id) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    updateChoreMutation.mutate({
      id: editingChore.id,
      updates: {
        title,
        description,
        due_date: dueDate,
        recurring,
        recurring_interval: recurring ? recurringInterval : undefined,
        family_id: family.id,
        assigned_to: assignedTo || currentUserId
      }
    });
  };

  const startEdit = (chore: Chore) => {
    setEditingChore(chore);
    setTitle(chore.title);
    setDescription(chore.description || '');
    setDueDate(chore.due_date || '');
    setRecurring(chore.recurring);
    setRecurringInterval(chore.recurring_interval || '');
    setAssignedTo(chore.assigned_to || undefined);
    setShowForm(true);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDueDate("");
    setRecurring(false);
    setRecurringInterval("");
    setAssignedTo(undefined);
    setEditingChore(null);
  };

  // Get the appropriate view description
  const getViewDescription = () => {
    if (family) {
      return `Manage ${family.name}'s chores`;
    }
    return "Manage chores";
  };

  // Get the appropriate button text
  const getAddButtonText = () => {
    if (family) {
      return `Add ${family.name} Chore`;
    }
    return "Add Chore";
  };

  // Function to sort chores
  const sortChores = (chores: Chore[]) => {
    return [...chores].sort((a, b) => {
      // First sort by completion status
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      
      // Then sort by due date
      const dateA = new Date(a.due_date).getTime();
      const dateB = new Date(b.due_date).getTime();
      return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading chores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 mb-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-chores">Chores</h1>
          <p className="text-muted-foreground">
            {getViewDescription()}
          </p>
        </div>
        <Dialog open={showForm} onOpenChange={(open) => {
          setShowForm(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-chores hover:bg-chores/90">
              <Plus className="mr-2 h-4 w-4" /> {getAddButtonText()}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingChore ? 'Edit Chore' : 'Add New Chore'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={editingChore ? handleEditChore : handleAddChore} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter chore title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter chore description"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="recurring"
                  checked={recurring}
                  onCheckedChange={setRecurring}
                />
                <Label htmlFor="recurring">Recurring Chore</Label>
              </div>
              {recurring && (
                <div className="space-y-2">
                  <Label htmlFor="recurringInterval">Repeat Interval</Label>
                  <Select value={recurringInterval} onValueChange={setRecurringInterval}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select interval" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              {family && (
                <div className="space-y-2">
                  <Label htmlFor="assignedTo">Assigned To</Label>
                  <Select
                    value={assignedTo || currentUserId || "unassigned"}
                    onValueChange={(value) => setAssignedTo(value === "unassigned" ? undefined : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select person" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={currentUserId || ""}>To Me</SelectItem>
                      {familyMembers
                        .filter(member => member.user_id !== currentUserId)
                        .map((member) => (
                          <SelectItem key={member.user_id} value={member.user_id}>
                            {member.display_name || member.user?.display_name || 'Unknown User'}
                          </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                <Button type="submit">
                  {editingChore ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort('dueDate')}
              className="hidden sm:flex items-center gap-2"
            >
              Due Date {sortConfig.key === 'dueDate' && (
                <ArrowUpDown className={`h-4 w-4 ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
              )}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : chores.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No chores found. Create one to get started!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {sortChores(chores).map((chore) => (
              <Card key={chore.id} className="relative">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={chore.completed}
                          onCheckedChange={(checked) => {
                            updateChoreMutation.mutate({
                              id: chore.id,
                              updates: { completed: !!checked }
                            });
                          }}
                        />
                        <h3 className={`font-semibold ${chore.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {chore.title}
                        </h3>
                      </div>
                      {chore.description && (
                        <p className="text-sm text-muted-foreground">{chore.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <CalendarClock className="mr-1 h-4 w-4" />
                          {new Date(chore.due_date).toLocaleString()}
                        </div>
                        {chore.recurring && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Repeat className="mr-1 h-4 w-4" />
                            {chore.recurring_interval ? `Repeats ${chore.recurring_interval}` : 'Recurring'}
                          </div>
                        )}
                        {chore.assigned_to && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <User className="mr-1 h-4 w-4" />
                            {familyMembers.find(m => m.user_id === chore.assigned_to)?.display_name || 
                             familyMembers.find(m => m.user_id === chore.assigned_to)?.user?.display_name || 
                             'Assigned'}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEdit(chore)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => deleteChoreMutation.mutate(chore.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChoresPage;
