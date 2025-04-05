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

const ChoresPage = () => {
  const [showForm, setShowForm] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [dueDate, setDueDate] = React.useState("");
  const [priority, setPriority] = React.useState<'low' | 'medium' | 'high'>('medium');
  const [isPersonal, setIsPersonal] = React.useState(false);
  const [assignedTo, setAssignedTo] = React.useState<string | null>(null);
  const { toast } = useToast();
  const { currentFamily } = useFamily();
  const { sortConfig, handleSort, getSortedItems } = useSortableList<'dueDate' | 'priority'>('dueDate');
  const [editingChore, setEditingChore] = React.useState<Chore | null>(null);
  const queryClient = useQueryClient();
  const [selectedFamilyId, setSelectedFamilyId] = React.useState<string | null>(null);

  // Query for fetching families
  const { data: families = [] } = useQuery({
    queryKey: ['families'],
    queryFn: () => familyService.getFamilies(),
  });

  // Query for fetching chores
  const { data: chores = [], isLoading } = useQuery({
    queryKey: ['chores', currentFamily === undefined ? 'all' : currentFamily === null ? 'personal' : currentFamily.id],
    queryFn: () => choresService.getChores(currentFamily),
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });

  // Query for fetching family members
  const { data: familyMembers = [] } = useQuery({
    queryKey: ['familyMembers', currentFamily?.id || selectedFamilyId],
    queryFn: () => {
      const familyId = currentFamily?.id || selectedFamilyId;
      return familyId ? familyService.getFamilyMembers(familyId) : [];
    },
    enabled: !!(currentFamily?.id || selectedFamilyId),
  });

  // Mutation for adding chores
  const addChoreMutation = useMutation({
    mutationFn: choresService.addChore,
    onSuccess: (newChore) => {
      const queryKey = ['chores', currentFamily === undefined ? 'all' : currentFamily === null ? 'personal' : currentFamily.id];
      queryClient.setQueryData(queryKey, (old: Chore[] = []) => [newChore, ...old]);
      queryClient.invalidateQueries({ 
        queryKey: ['dashboardStats', currentFamily?.id ?? (currentFamily === null ? 'personal' : 'all')],
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
    mutationFn: ({ id, updates }: { id: number; updates: Partial<Chore> }) => 
      choresService.updateChore(id, updates),
    onSuccess: (updatedChore) => {
      const queryKey = ['chores', currentFamily === undefined ? 'all' : currentFamily === null ? 'personal' : currentFamily.id];
      queryClient.setQueryData(queryKey, (old: Chore[] = []) => 
        old.map(c => c.id === updatedChore.id ? updatedChore : c)
      );
      queryClient.invalidateQueries({ 
        queryKey: ['dashboardStats', currentFamily?.id ?? (currentFamily === null ? 'personal' : 'all')],
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
      const queryKey = ['chores', currentFamily === undefined ? 'all' : currentFamily === null ? 'personal' : currentFamily.id];
      queryClient.setQueryData(queryKey, (old: Chore[] = []) => 
        old.filter(c => c.id !== deletedId)
      );
      queryClient.invalidateQueries({ 
        queryKey: ['dashboardStats', currentFamily?.id ?? (currentFamily === null ? 'personal' : 'all')],
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
    if (!title || !dueDate) return;

    addChoreMutation.mutate({
      title,
      description,
      due_date: dueDate,
      priority,
      status: 'pending',
      is_personal: currentFamily === undefined ? !selectedFamilyId : isPersonal,
      family_id: currentFamily === undefined ? selectedFamilyId : (isPersonal ? null : currentFamily?.id),
      assigned_to: assignedTo
    });
  };

  const handleEditChore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChore || !title || !dueDate) return;

    updateChoreMutation.mutate({
      id: editingChore.id,
      updates: {
        title,
        description,
        due_date: dueDate,
        priority,
        is_personal: currentFamily === undefined ? !selectedFamilyId : isPersonal,
        family_id: currentFamily === undefined ? selectedFamilyId : (isPersonal ? null : currentFamily?.id),
        assigned_to: assignedTo
      }
    });
  };

  const startEdit = (chore: Chore) => {
    setEditingChore(chore);
    setTitle(chore.title);
    setDescription(chore.description || '');
    setDueDate(chore.due_date);
    setPriority(chore.priority);
    setSelectedFamilyId(chore.family_id || null);
    setIsPersonal(chore.is_personal);
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
    const chore = chores.find(c => c.id === id);
    if (!chore) return;

    updateChoreMutation.mutate({
      id,
      updates: {
        status: chore.status === 'completed' ? 'pending' : 'completed'
      }
    });
  };

  const deleteChore = async (id: number) => {
    deleteChoreMutation.mutate(id);
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

  // Get the appropriate view description
  const getViewDescription = () => {
    if (currentFamily === undefined) {
      return "Manage chores across all your families";
    } else if (currentFamily === null) {
      return "Manage your personal chores";
    } else {
      return `Manage ${currentFamily.name}'s chores`;
    }
  };

  // Get the appropriate button text
  const getAddButtonText = () => {
    if (currentFamily === undefined) {
      return "Add Family Chore";
    } else if (currentFamily === null) {
      return "Add Personal Chore";
    } else {
      return `Add ${currentFamily.name} Chore`;
    }
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
              {/* Show Assigned To when in family view or when a family is selected */}
              {((currentFamily && !isPersonal) || (!isPersonal && selectedFamilyId)) && (
                <div className="space-y-2">
                  <Label htmlFor="assignedTo">Assigned To</Label>
                  <Select
                    value={assignedTo || "unassigned"}
                    onValueChange={(value) => setAssignedTo(value === "unassigned" ? null : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select person" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {familyMembers.map((member) => (
                        <SelectItem key={member.user_id} value={member.user_id}>
                          {member.display_name || member.user_id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {currentFamily === undefined && (
                <div className="space-y-2">
                  <Label>Family</Label>
                  <Select
                    value={selectedFamilyId || "personal"}
                    onValueChange={(value) => {
                      setSelectedFamilyId(value === "personal" ? null : value);
                      setIsPersonal(value === "personal");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select family" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal">Personal</SelectItem>
                      {families.map((family) => (
                        <SelectItem key={family.id} value={family.id}>
                          {family.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {currentFamily !== undefined && (
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isPersonal"
                    checked={isPersonal}
                    onCheckedChange={setIsPersonal}
                  />
                  <Label htmlFor="isPersonal">Make it personal</Label>
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort('priority')}
              className="hidden sm:flex items-center gap-2"
            >
              Priority {sortConfig.key === 'priority' && (
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
            {getSortedItems(chores).map((chore) => (
              <Card key={chore.id} className="relative">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
              <Checkbox
                          checked={chore.status === 'completed'}
                          onCheckedChange={(checked) => {
                            updateChoreMutation.mutate({
                              id: chore.id,
                              updates: { status: checked ? 'completed' : 'pending' }
                            });
                          }}
                        />
                        <h3 className={`font-semibold ${chore.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
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
                        <div className={`flex items-center text-xs ${
                          chore.priority === 'high' ? 'text-red-500' :
                          chore.priority === 'medium' ? 'text-yellow-500' :
                          'text-green-500'
                        }`}>
                          <span className="capitalize">{chore.priority}</span>
                        </div>
                        {chore.is_personal && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <User className="mr-1 h-4 w-4" />
                            Personal
                          </div>
                  )}
                </div>
              </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingChore(chore);
                          setTitle(chore.title);
                          setDescription(chore.description || '');
                          setDueDate(chore.due_date);
                          setPriority(chore.priority);
                          setIsPersonal(chore.is_personal);
                          setShowForm(true);
                        }}
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
