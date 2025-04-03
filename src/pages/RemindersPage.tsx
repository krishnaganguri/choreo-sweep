import React, { useState, useEffect } from "react";
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
import { useSortableList } from "@/lib/hooks/useSortableList";
import type { Reminder } from "@/lib/types";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

const RemindersPage = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [isPersonal, setIsPersonal] = useState(false);
  const { toast } = useToast();
  const { currentFamily } = useFamily();
  const { sortConfig, handleSort, getSortedItems } = useSortableList<'date' | 'priority'>('date');
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      const data = await remindersService.getReminders();
      setReminders(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load reminders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sortedReminders = getSortedItems(reminders, 'completed', (a, b, sortBy, sortOrder) => {
    switch (sortBy) {
      case 'date': {
        const dateTimeA = new Date(`${a.date}T${a.time}`).getTime();
        const dateTimeB = new Date(`${b.date}T${b.time}`).getTime();
        return sortOrder === 'asc' ? dateTimeA - dateTimeB : dateTimeB - dateTimeA;
      }
      case 'priority': {
        const priorityOrder = { low: 1, medium: 2, high: 3 };
        const orderA = priorityOrder[a.priority];
        const orderB = priorityOrder[b.priority];
        return sortOrder === 'asc' ? orderA - orderB : orderB - orderA;
      }
      default:
        return 0;
    }
  });

  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !time) return;

    try {
      const newReminder = await remindersService.addReminder({
        title,
        description,
        date,
        time,
        priority,
        completed: false,
        is_personal: isPersonal,
        family_id: !isPersonal ? currentFamily?.id : undefined
      });
      setReminders([newReminder, ...reminders]);
      setShowForm(false);
      resetForm();
      toast({
        title: "Success",
        description: "Reminder added successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add reminder. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReminder || !title || !date || !time) return;

    try {
      const updatedReminder = await remindersService.updateReminder(editingReminder.id, {
        title,
        description,
        date,
        time,
        priority,
        is_personal: isPersonal,
        family_id: !isPersonal ? currentFamily?.id : undefined
      });

      setReminders(reminders.map(rem => rem.id === editingReminder.id ? updatedReminder : rem));
      setShowForm(false);
      resetForm();
      toast({
        title: "Success",
        description: "Reminder updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update reminder. Please try again.",
        variant: "destructive",
      });
    }
  };

  const startEdit = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setTitle(reminder.title);
    setDescription(reminder.description || "");
    setDate(reminder.date);
    setTime(reminder.time);
    setPriority(reminder.priority);
    setIsPersonal(!reminder.family_id);
    setShowForm(true);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDate("");
    setTime("");
    setPriority("medium");
    setIsPersonal(false);
    setEditingReminder(null);
  };

  const toggleReminderCompletion = async (id: number) => {
    try {
      const reminder = reminders.find(r => r.id === id);
      if (!reminder) return;

      const updatedReminder = await remindersService.updateReminder(id, {
        completed: !reminder.completed
      });

      setReminders(reminders.map(r => r.id === id ? updatedReminder : r));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update reminder. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteReminder = async (id: number) => {
    try {
      await remindersService.deleteReminder(id);
      setReminders(reminders.filter(r => r.id !== id));
      toast({
        title: "Success",
        description: "Reminder deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete reminder. Please try again.",
        variant: "destructive",
      });
    }
  };

  const priorityColors = {
    low: "text-green-500",
    medium: "text-yellow-500",
    high: "text-red-500"
  };

  if (loading) {
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
            {currentFamily ? `Manage ${currentFamily.name}'s reminders` : 'Manage your reminders'}
          </p>
        </div>
        {reminders.some(reminder => reminder.completed) && (
          <Button 
            variant="outline" 
            className="text-destructive"
            onClick={() => {
              const completedReminders = reminders.filter(reminder => reminder.completed);
              Promise.all(completedReminders.map(reminder => 
                remindersService.deleteReminder(reminder.id)
              ));
              setReminders(reminders.filter(reminder => !reminder.completed));
              toast({
                title: "Success",
                description: "Completed reminders deleted successfully.",
              });
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete completed
          </Button>
        )}
      </div>

      <Dialog open={showForm} onOpenChange={(open) => {
        setShowForm(open);
        if (!open) resetForm();
      }}>
        <DialogTrigger asChild>
          <Button className="bg-reminders hover:bg-reminders/90">
            <Plus className="mr-2 h-4 w-4" /> Add Reminder
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingReminder ? 'Edit Reminder' : 'Add New Reminder'}</DialogTitle>
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
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
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
            {currentFamily && (
              <div className="flex items-center space-x-2">
                <Switch
                  id="personal"
                  checked={isPersonal}
                  onCheckedChange={setIsPersonal}
                />
                <Label htmlFor="personal">Make this a personal reminder</Label>
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

      <div className="flex gap-2 overflow-x-auto py-2">
        <Button 
          variant="outline" 
          className={`flex gap-1 whitespace-nowrap ${sortConfig.sortBy === 'date' ? 'bg-secondary' : ''}`}
          onClick={() => handleSort('date')}
        >
          <ArrowUpDown className="h-4 w-4" /> 
          Date & Time {sortConfig.sortBy === 'date' && (sortConfig.sortOrder === 'asc' ? '↑' : '↓')}
        </Button>
        <Button 
          variant="outline" 
          className={`flex gap-1 whitespace-nowrap ${sortConfig.sortBy === 'priority' ? 'bg-secondary' : ''}`}
          onClick={() => handleSort('priority')}
        >
          <ArrowUpDown className="h-4 w-4" /> 
          Priority {sortConfig.sortBy === 'priority' && (sortConfig.sortOrder === 'asc' ? '↑' : '↓')}
        </Button>
      </div>

      <div className="space-y-3">
        {sortedReminders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No reminders yet. Add your first reminder to get started!
          </div>
        ) : (
          sortedReminders.map((reminder) => (
            <div
              key={reminder.id}
              className="card-container flex items-center gap-3"
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
                    reminder.completed ? "line-through" : ""
                  }`}
                >
                  {reminder.title}
                </label>
                {reminder.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {reminder.description}
                  </p>
                )}
                <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                  <span className="bg-secondary px-2 py-0.5 rounded-full">
                    {new Date(`${reminder.date}T${reminder.time}`).toLocaleString()}
                  </span>
                  <span className={`bg-secondary px-2 py-0.5 rounded-full ${priorityColors[reminder.priority]}`}>
                    {reminder.priority.charAt(0).toUpperCase() + reminder.priority.slice(1)} Priority
                  </span>
                  {currentFamily && (
                    <span className="bg-secondary px-2 py-0.5 rounded-full">
                      {reminder.family_id ? 'Family' : 'Personal'}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
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
