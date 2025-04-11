import React, { useState, useEffect, useMemo } from "react";
import { Plus, Calendar, Clock, Bell, CheckCircle2, Trash2, ArrowUpDown, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { remindersService } from "@/lib/services";
import { useFamily } from "@/lib/hooks/useFamily";
import { useSortableList, SortConfig } from "@/lib/hooks/useSortableList";
import type { Reminder } from "@/lib/types";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Define types for mutation inputs explicitly
// Match the service's expected input type signature more closely for addReminder
interface AddReminderServiceInput extends Omit<Reminder, 'id' | 'created_at'> {}
// Keep UpdateReminderInput as partial omit including created_by
interface UpdateReminderInput extends Partial<Omit<Reminder, 'id' | 'created_at' | 'created_by'>> {}

const RemindersPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [isPersonal, setIsPersonal] = useState(false);
  const { toast } = useToast();
  const { family: currentFamily } = useFamily();
  const { sortConfig, handleSort, getSortedItems } = useSortableList<'due_date' | 'priority'>('due_date');
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const queryClient = useQueryClient();
  const [viewType, setViewType] = useState<'personal' | 'family'>('personal');

  useEffect(() => {
    if (!currentFamily) {
      setViewType('personal');
    }
    // Reset isPersonal state when view type changes
    setIsPersonal(viewType === 'personal'); 
  }, [currentFamily, viewType]);

  const { data: reminders = [], isLoading } = useQuery({
    queryKey: ['reminders', currentFamily?.id],
    queryFn: () => remindersService.getReminders(currentFamily?.id),
    staleTime: 1000 * 60 * 5,
  });

  const filteredReminders = useMemo(() => {
    if (viewType === 'personal') {
      return reminders.filter(r => r.is_personal || !r.family_id);
    } else if (viewType === 'family' && currentFamily) {
      return reminders.filter(r => r.family_id === currentFamily.id && !r.is_personal);
    }
    return [];
  }, [reminders, viewType, currentFamily]);

  // Use one of the valid sort keys for the second arg, handle completed sort separately if needed
  const sortedReminders = getSortedItems(filteredReminders, 'due_date', (a: Reminder, b: Reminder, sortBy, sortOrder) => {
      // Primary sort based on the key from sortConfig (due_date or priority)
      let comparison = 0;
      if (sortBy === 'due_date') {
        const dateA = new Date(a.due_date).getTime();
        const dateB = new Date(b.due_date).getTime();
        if (isNaN(dateA) && isNaN(dateB)) comparison = 0;
        else if (isNaN(dateA)) comparison = 1;
        else if (isNaN(dateB)) comparison = -1;
        else comparison = dateA - dateB;
      } else if (sortBy === 'priority') {
        const priorityOrder = { low: 1, medium: 2, high: 3 };
        const orderA = priorityOrder[a.priority as keyof typeof priorityOrder];
        const orderB = priorityOrder[b.priority as keyof typeof priorityOrder];
        comparison = orderA - orderB;
      }

      // Apply ascending/descending direction
      const directionMultiplier = sortOrder === 'asc' ? 1 : -1;
      comparison *= directionMultiplier;

      return comparison;
  }).sort((a, b) => { 
       // Secondary sort: always put incomplete items first
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      return 0;
  });

  const addReminderMutation = useMutation({
    mutationFn: (newReminder: AddReminderServiceInput) => remindersService.addReminder(newReminder),
    onSuccess: (newReminder) => {
      queryClient.setQueryData(['reminders', currentFamily?.id], (old: Reminder[] = []) => [newReminder, ...old]);
      queryClient.invalidateQueries({ 
        queryKey: ['dashboardStats', currentFamily?.id ?? (currentFamily === null ? 'personal' : 'all')],
      });
      setShowForm(false);
      resetForm();
      toast({
        title: "Success",
        description: "Reminder added successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Adding Reminder",
        description: error?.message || "Failed to add reminder. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateReminderMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: UpdateReminderInput }) => 
      remindersService.updateReminder(id, updates),
    onSuccess: (updatedReminder) => {
      queryClient.setQueryData(['reminders', currentFamily?.id], (old: Reminder[] = []) => 
        old.map(rem => rem.id === updatedReminder.id ? updatedReminder : rem)
      );
      queryClient.invalidateQueries({ 
        queryKey: ['dashboardStats', currentFamily?.id ?? (currentFamily === null ? 'personal' : 'all')],
      });
      setShowForm(false);
      resetForm();
      toast({
        title: "Success",
        description: "Reminder updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Updating Reminder",
        description: error?.message || "Failed to update reminder. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteReminderMutation = useMutation({
    mutationFn: remindersService.deleteReminder,
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData(['reminders', currentFamily?.id], (old: Reminder[] = []) => 
        old.filter(rem => rem.id !== deletedId)
      );
      queryClient.invalidateQueries({ 
        queryKey: ['dashboardStats', currentFamily?.id ?? (currentFamily === null ? 'personal' : 'all')],
      });
      // Don't toast here if called from Promise.all, handle it there
    },
    onError: (error: any) => {
      toast({
        title: "Error Deleting Reminder",
        description: error?.message || "Failed to delete reminder. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dueDate) {
       toast({ title: "Missing Fields", description: "Please provide a title and due date.", variant: "destructive" });
      return;
    }

    const isAddingPersonal = viewType === 'personal' || (viewType === 'family' && isPersonal);
    const targetFamilyId = viewType === 'family' && !isAddingPersonal ? currentFamily?.id : null;

    // Construct the object based on Reminder structure, 
    // but cast to AddReminderServiceInput for the mutation call.
    // We know created_by will be handled by the service.
    const reminderData = {
      title,
      description,
      due_date: dueDate,
      priority,
      completed: false,
      is_personal: isAddingPersonal,
      family_id: targetFamilyId,
      // Include other required fields from Reminder type if necessary, even if dummy,
      // to satisfy the Omit type for the service call signature, but created_by is added by service
      created_by: "" // Dummy value to satisfy type, service will overwrite
    };

    addReminderMutation.mutate(reminderData as AddReminderServiceInput);
  };

  const handleEditReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReminder || !title || !dueDate) {
      toast({ title: "Missing Fields", description: "Please provide a title and due date.", variant: "destructive" });
      return;
    }

    const isUpdatingPersonal = viewType === 'personal' || (viewType === 'family' && isPersonal);
    const targetFamilyId = isUpdatingPersonal ? null : (viewType === 'family' ? currentFamily?.id : editingReminder.family_id);

    const reminderUpdates: UpdateReminderInput = {
      title,
      description,
      due_date: dueDate,
      priority,
      is_personal: isUpdatingPersonal,
      family_id: targetFamilyId,
    };

    updateReminderMutation.mutate({
      id: editingReminder.id,
      updates: reminderUpdates,
    });
  };

  const startEdit = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setTitle(reminder.title);
    setDescription(reminder.description || "");
    // Format date for datetime-local input (YYYY-MM-DDTHH:mm)
    try {
        const dateObj = new Date(reminder.due_date);
        const year = dateObj.getFullYear();
        const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
        const day = dateObj.getDate().toString().padStart(2, '0');
        const hours = dateObj.getHours().toString().padStart(2, '0');
        const minutes = dateObj.getMinutes().toString().padStart(2, '0');
        setDueDate(`${year}-${month}-${day}T${hours}:${minutes}`);
    } catch (e) {
        setDueDate(""); // Fallback if date is invalid
    }
    setPriority(reminder.priority);
    setIsPersonal(reminder.is_personal || !reminder.family_id); 
    setShowForm(true);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDueDate("");
    setPriority("medium");
    setIsPersonal(viewType === 'personal'); // Reset based on current view
    setEditingReminder(null);
  };

  const toggleReminderCompletion = (id: number) => {
    const reminder = reminders.find(r => r.id === id);
    if (!reminder) return;

    updateReminderMutation.mutate({
      id,
      updates: {
        completed: !reminder.completed
      }
    });
  };

  const deleteReminder = (id: number) => {
    deleteReminderMutation.mutate(id);
  };

  const priorityColors = {
    low: "text-green-500",
    medium: "text-yellow-500",
    high: "text-red-500"
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading reminders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 mb-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-reminders">Reminders</h1>
          <p className="text-muted-foreground">
            {viewType === 'personal' ? 'Manage your personal reminders' : 
             currentFamily ? `Manage ${currentFamily.name}'s reminders` : 'Manage reminders'}
          </p>
        </div>
        {/* Delete completed button logic */} 
        {reminders.some(reminder => reminder.completed) && (
          <Button 
            variant="outline" 
            className="text-destructive"
            onClick={() => {
              const completedReminders = filteredReminders.filter(reminder => reminder.completed);
              if (completedReminders.length === 0) return;
              Promise.all(completedReminders.map(reminder => 
                deleteReminderMutation.mutateAsync(reminder.id) 
              )).then(() => {
                 toast({
                  title: "Success",
                  description: `Deleted ${completedReminders.length} completed reminder(s).`,
                });
                // Invalidation happens in mutation's onSuccess, triggering data refresh
              }).catch((error) => {
                 toast({
                  title: "Error Deleting Completed",
                  description: "Failed to delete some completed reminders. Please try again.",
                  variant: "destructive",
                });
              });
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete completed
          </Button>
        )}
      </div>

      <Tabs value={viewType} onValueChange={(value) => setViewType(value as 'personal' | 'family')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="family" disabled={!currentFamily}>
            {currentFamily ? `${currentFamily.name}` : 'Family'}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Dialog open={showForm} onOpenChange={(open) => {
        setShowForm(open);
        if (!open) resetForm();
      }}>
        <DialogTrigger asChild>
          <Button className="bg-reminders hover:bg-reminders/90" disabled={viewType === 'family' && !currentFamily}>
            <Plus className="mr-2 h-4 w-4" /> Add {viewType === 'personal' ? 'Personal' : 'Family'} Reminder
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingReminder ? 'Edit' : 'Add New'} {viewType === 'personal' ? 'Personal' : 'Family'} Reminder</DialogTitle>
          </DialogHeader>
          <form onSubmit={editingReminder ? handleEditReminder : handleAddReminder} className="space-y-4">
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
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date & Time</Label>
              <Input
                id="dueDate"
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={(value: "low" | "medium" | "high") => setPriority(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {viewType === 'family' && currentFamily && (
              <div className="flex items-center space-x-2">
                <Switch
                  id="personal"
                  checked={isPersonal}
                  onCheckedChange={setIsPersonal}
                />
                <Label htmlFor="personal">Make this a personal reminder (visible only to you)</Label>
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
              <Button type="submit" className="bg-reminders hover:bg-reminders/90">
                {editingReminder ? 'Update' : 'Add'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="flex justify-end gap-2">
         <Button 
          variant="outline" 
          className={`flex gap-1 whitespace-nowrap ${sortConfig.key === 'due_date' ? 'bg-secondary' : ''}`}
          onClick={() => handleSort('due_date')}
        >
          <ArrowUpDown className="h-4 w-4" /> 
          Due Date {sortConfig.key === 'due_date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
        </Button>
        <Button 
          variant="outline" 
          className={`flex gap-1 whitespace-nowrap ${sortConfig.key === 'priority' ? 'bg-secondary' : ''}`}
          onClick={() => handleSort('priority')}
        >
          <ArrowUpDown className="h-4 w-4" /> 
          Priority {sortConfig.key === 'priority' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
        </Button>
      </div>

      <div className="space-y-4">
        {filteredReminders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No {viewType} reminders yet. Add your first one to get started!
          </div>
        ) : (
          sortedReminders.map((reminder) => ( 
            <div
              key={reminder.id}
              className="card-container flex items-center gap-3 p-4 border rounded-lg shadow-sm"
            >
              <Checkbox
                id={`reminder-${reminder.id}`}
                checked={reminder.completed}
                onCheckedChange={() => toggleReminderCompletion(reminder.id)}
                className="border-reminders"
              />
              <div className="flex-1">
                <label
                  htmlFor={`reminder-${reminder.id}`}
                  className={`font-medium cursor-pointer ${
                    reminder.completed ? "line-through text-muted-foreground" : ""
                  }`}
                >
                  {reminder.title}
                </label>
                {reminder.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {reminder.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="bg-secondary px-2 py-0.5 rounded-full text-xs">
                    {/* Format date for display */}
                    {reminder.due_date ? new Date(reminder.due_date).toLocaleString() : 'No due date'}
                  </span>
                  <span className={`bg-secondary px-2 py-0.5 rounded-full text-xs ${priorityColors[reminder.priority as keyof typeof priorityColors]}`}>
                    {reminder.priority.charAt(0).toUpperCase() + reminder.priority.slice(1)} Priority
                  </span>
                  {(currentFamily || reminder.family_id) && (
                    <span className="bg-secondary px-2 py-0.5 rounded-full text-xs">
                      {reminder.is_personal || !reminder.family_id ? 'Personal' : 'Family'}
                    </span>
                  )}
                </div>
              </div>
              {/* Action Buttons (Edit/Delete) */}
              <div className="flex gap-1">
                 <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => startEdit(reminder)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteReminder(reminder.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RemindersPage;
