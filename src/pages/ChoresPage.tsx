import React, { useState, useEffect } from "react";
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

const ChoresPage = () => {
  const [chores, setChores] = useState<Chore[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isPersonal, setIsPersonal] = useState(false);
  const [assignedTo, setAssignedTo] = useState<string | null>(null);
  const { toast } = useToast();
  const { currentFamily, families } = useFamily();
  const { sortConfig, handleSort, getSortedItems } = useSortableList<'dueDate' | 'priority'>('dueDate');
  const [editingChore, setEditingChore] = useState<Chore | null>(null);

  useEffect(() => {
    loadChores();
  }, []);

  const loadChores = async () => {
    try {
      const data = await choresService.getChores();
      setChores(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load chores. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sortedChores = getSortedItems(chores, 'status', (a, b, sortBy, sortOrder) => {
    // First, sort by completion status
    if (a.status !== b.status) {
      return a.status === 'completed' ? 1 : -1;
    }

    // Then sort by the selected criteria
    switch (sortBy) {
      case 'dueDate': {
        const dateA = new Date(a.due_date).getTime();
        const dateB = new Date(b.due_date).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }
      case 'priority': {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const orderA = priorityOrder[a.priority];
        const orderB = priorityOrder[b.priority];
        return sortOrder === 'asc' ? orderA - orderB : orderB - orderA;
      }
      default:
        return 0;
    }
  });

  const handleAddChore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dueDate) return;

    try {
      const newChore = await choresService.addChore({
        title,
        description,
        due_date: dueDate,
        priority,
        status: 'pending',
        is_personal: isPersonal,
        family_id: !isPersonal ? currentFamily?.id : undefined,
        assigned_to: assignedTo
      });
      setChores([newChore, ...chores]);
      setShowForm(false);
      resetForm();
      toast({
        title: "Success",
        description: "Chore added successfully.",
      });
    } catch (error) {
      console.error('Error adding chore:', error);
      toast({
        title: "Error",
        description: "Failed to add chore. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditChore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChore || !title || !dueDate) return;

    try {
      const updatedChore = await choresService.updateChore(editingChore.id, {
        title,
        description,
        due_date: dueDate,
        priority,
        is_personal: isPersonal,
        family_id: !isPersonal ? currentFamily?.id : undefined,
        assigned_to: assignedTo
      });

      setChores(chores.map(c => c.id === editingChore.id ? updatedChore : c));
      setShowForm(false);
      resetForm();
      toast({
        title: "Success",
        description: "Chore updated successfully.",
      });
    } catch (error) {
      console.error('Error updating chore:', error);
      toast({
        title: "Error",
        description: "Failed to update chore. Please try again.",
        variant: "destructive",
      });
    }
  };

  const startEdit = (chore: Chore) => {
    setEditingChore(chore);
    setTitle(chore.title);
    setDescription(chore.description || '');
    setDueDate(chore.due_date);
    setPriority(chore.priority);
    setIsPersonal(!chore.family_id);
    setAssignedTo(chore.assigned_to || null);
    setShowForm(true);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDueDate("");
    setPriority('medium');
    setIsPersonal(false);
    setAssignedTo(null);
    setEditingChore(null);
  };

  const toggleChoreCompletion = async (id: number) => {
    try {
      const chore = chores.find(c => c.id === id);
      if (!chore) return;

      const updatedChore = await choresService.updateChore(id, {
        status: chore.status === 'completed' ? 'pending' : 'completed'
      });

      const updatedChores = chores.map(c => 
        c.id === id ? updatedChore : c
      );
      setChores(updatedChores);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update chore. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteChore = async (id: number) => {
    try {
      await choresService.deleteChore(id);
      setChores(chores.filter(c => c.id !== id));
      toast({
        title: "Success",
        description: "Chore deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete chore. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
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
            {currentFamily ? `Manage ${currentFamily.name}'s tasks` : 'Manage your tasks'}
          </p>
        </div>
        <Dialog open={showForm} onOpenChange={(open) => {
          setShowForm(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-chores hover:bg-chores/90">
              <Plus className="mr-2 h-4 w-4" /> Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingChore ? 'Edit Chore' : 'Add New Chore'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={editingChore ? handleEditChore : handleAddChore} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Chore Title</Label>
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
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={(value: 'low' | 'medium' | 'high') => setPriority(value)}>
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
                <>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="personal"
                      checked={isPersonal}
                      onCheckedChange={setIsPersonal}
                    />
                    <Label htmlFor="personal">Make this a personal task</Label>
                  </div>
                  {currentFamily && !isPersonal && (
                    <div className="space-y-2">
                      <Label htmlFor="assignedTo">Assign To</Label>
                      <Select 
                        value={assignedTo || "unassigned"} 
                        onValueChange={(value) => setAssignedTo(value === "unassigned" ? null : value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select family member" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {currentFamily.members?.map((member) => (
                            <SelectItem key={member.user_id} value={member.user_id}>
                              {member.display_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </>
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
                <Button type="submit" className="bg-chores hover:bg-chores/90">
                  {editingChore ? 'Update' : 'Add'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 overflow-x-auto py-2">
        <Button 
          variant="outline" 
          className={`flex gap-1 whitespace-nowrap ${sortConfig.sortBy === 'dueDate' ? 'bg-secondary' : ''}`}
          onClick={() => handleSort('dueDate')}
        >
          <ArrowUpDown className="h-4 w-4" /> 
          Due Date {sortConfig.sortBy === 'dueDate' && (sortConfig.sortOrder === 'asc' ? '↑' : '↓')}
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
        {sortedChores.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No chores yet. Add your first chore to get started!
          </div>
        ) : (
          sortedChores.map((chore) => (
            <div
              key={chore.id}
              className="card-container flex items-center gap-3"
            >
              <Checkbox
                id={`chore-${chore.id}`}
                checked={chore.status === 'completed'}
                onCheckedChange={() => toggleChoreCompletion(chore.id)}
                className="border-chores"
              />
              <div className="flex-1">
                <label
                  htmlFor={`chore-${chore.id}`}
                  className={`font-medium cursor-pointer ${
                    chore.status === 'completed' ? "line-through" : ""
                  }`}
                >
                  {chore.title}
                </label>
                <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                  <span className="bg-secondary px-2 py-0.5 rounded-full">
                    {new Date(chore.due_date || '').toLocaleDateString()}
                  </span>
                  <span className={`bg-secondary px-2 py-0.5 rounded-full ${
                    chore.priority === 'high' ? 'text-red-500' :
                    chore.priority === 'medium' ? 'text-yellow-500' :
                    'text-green-500'
                  }`}>
                    {chore.priority.charAt(0).toUpperCase() + chore.priority.slice(1)}
                  </span>
                  {chore.assigned_to && (
                    <span className="bg-secondary flex items-center gap-1 px-2 py-0.5 rounded-full">
                      <Users className="h-3 w-3" /> 
                      {currentFamily?.members?.find(m => m.user_id === chore.assigned_to)?.display_name || 'Assigned'}
                    </span>
                  )}
                  {currentFamily && (
                    <span className="bg-secondary px-2 py-0.5 rounded-full">
                      {chore.family_id ? 'Family' : 'Personal'}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => startEdit(chore)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteChore(chore.id)}
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

export default ChoresPage;
