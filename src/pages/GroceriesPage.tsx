import React from "react";
import { Plus, ArrowUpDown, Trash2, ShoppingBag, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { groceriesService } from "@/lib/services";
import { useFamily } from "@/lib/hooks/useFamily";
import { useSortableList } from "@/lib/hooks/useSortableList";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { GroceryItem } from "@/lib/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const GroceriesPage = () => {
  const [showForm, setShowForm] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [quantity, setQuantity] = React.useState("1");
  const [category, setCategory] = React.useState<string>("other");
  const [isPersonal, setIsPersonal] = React.useState(false);
  const { toast } = useToast();
  const { currentFamily } = useFamily();
  const { sortConfig, handleSort, getSortedItems } = useSortableList<'title' | 'category'>('title');
  const [editingItem, setEditingItem] = React.useState<GroceryItem | null>(null);
  const queryClient = useQueryClient();

  // Query for fetching grocery items
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['groceries', currentFamily?.id],
    queryFn: () => groceriesService.getGroceryItems(currentFamily?.id),
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });

  // Mutation for adding items
  const addItemMutation = useMutation({
    mutationFn: groceriesService.addGroceryItem,
    onSuccess: (newItem) => {
      queryClient.setQueryData(['groceries', currentFamily?.id], (old: GroceryItem[] = []) => [newItem, ...old]);
      queryClient.invalidateQueries({ 
        queryKey: ['dashboardStats', currentFamily?.id ?? (currentFamily === null ? 'personal' : 'all')],
      });
      setShowForm(false);
      resetForm();
      toast({
        title: "Success",
        description: "Item added successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add item. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation for updating items
  const updateItemMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<GroceryItem> }) => 
      groceriesService.updateGroceryItem(id, updates),
    onSuccess: (updatedItem) => {
      queryClient.setQueryData(['groceries', currentFamily?.id], (old: GroceryItem[] = []) => 
        old.map(item => item.id === updatedItem.id ? updatedItem : item)
      );
      queryClient.invalidateQueries({ 
        queryKey: ['dashboardStats', currentFamily?.id ?? (currentFamily === null ? 'personal' : 'all')],
      });
      setShowForm(false);
      resetForm();
      toast({
        title: "Success",
        description: "Item updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update item. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation for deleting items
  const deleteItemMutation = useMutation({
    mutationFn: groceriesService.deleteGroceryItem,
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData(['groceries', currentFamily?.id], (old: GroceryItem[] = []) => 
        old.filter(item => item.id !== deletedId)
      );
      queryClient.invalidateQueries({ 
        queryKey: ['dashboardStats', currentFamily?.id ?? (currentFamily === null ? 'personal' : 'all')],
      });
      toast({
        title: "Success",
        description: "Item deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete item. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    addItemMutation.mutate({
      title,
      quantity,
      category,
      completed: false,
      is_personal: isPersonal,
      family_id: !isPersonal ? currentFamily?.id : undefined
    });
  };

  const handleEditItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !title) return;

    updateItemMutation.mutate({
      id: editingItem.id,
      updates: {
        title,
        quantity,
        category,
        is_personal: isPersonal,
        family_id: !isPersonal ? currentFamily?.id : undefined
      }
    });
  };

  const startEdit = (item: GroceryItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setQuantity(item.quantity);
    setCategory(item.category);
    setIsPersonal(!item.family_id);
    setShowForm(true);
  };

  const resetForm = () => {
    setTitle("");
    setQuantity("1");
    setCategory("other");
    setIsPersonal(false);
    setEditingItem(null);
  };

  const toggleItemCompletion = async (id: number) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    updateItemMutation.mutate({
      id,
      updates: {
        completed: !item.completed
      }
    });
  };

  const deleteItem = async (id: number) => {
    deleteItemMutation.mutate(id);
  };

  const categories = [
    "produce",
    "dairy",
    "meat",
    "pantry",
    "frozen",
    "beverages",
    "snacks",
    "household",
    "other"
  ];

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading grocery items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-groceries">Groceries</h1>
            <p className="text-muted-foreground">
            {currentFamily ? `Manage ${currentFamily.name}'s shopping list` : 'Manage your shopping list'}
            </p>
          </div>
        {items.some(item => item.completed) && (
            <Button 
              variant="outline" 
              className="text-destructive"
            onClick={() => {
              const checkedItems = items.filter(item => item.completed);
              Promise.all(checkedItems.map(item => 
                groceriesService.deleteGroceryItem(item.id)
              ));
              setItems(items.filter(item => !item.completed));
              toast({
                title: "Success",
                description: "Checked items deleted successfully.",
              });
            }}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete checked
            </Button>
          )}
        </div>

      <Dialog open={showForm} onOpenChange={(open) => {
        setShowForm(open);
        if (!open) resetForm();
      }}>
        <DialogTrigger asChild>
          <Button className="bg-groceries hover:bg-groceries/90">
            <Plus className="mr-2 h-4 w-4" /> Add Item
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={editingItem ? handleEditItem : handleAddItem} className="space-y-4">
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
              <Label htmlFor="quantity">Quantity</Label>
          <Input
                id="quantity"
                type="text"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="1"
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
                <Label htmlFor="personal">Make this a personal item</Label>
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
              <Button type="submit" className="bg-groceries hover:bg-groceries/90">
                {editingItem ? 'Update' : 'Add'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="flex gap-2 overflow-x-auto py-2">
        <Button 
          variant="outline" 
          className={`flex gap-1 whitespace-nowrap ${sortConfig.sortBy === 'title' ? 'bg-secondary' : ''}`}
          onClick={() => handleSort('title')}
        >
          <ArrowUpDown className="h-4 w-4" /> 
          Title {sortConfig.sortBy === 'title' && (sortConfig.sortOrder === 'asc' ? '↑' : '↓')}
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

        <div className="space-y-4">
        {items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No items yet. Add your first item to get started!
              </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="card-container flex items-center gap-3"
            >
                    <Checkbox
                      id={`item-${item.id}`}
                checked={item.completed}
                onCheckedChange={() => toggleItemCompletion(item.id)}
                      className="border-groceries"
                    />
              <div className="flex-1">
                      <label
                        htmlFor={`item-${item.id}`}
                        className={`font-medium cursor-pointer ${
                    item.completed ? "line-through" : ""
                        }`}
                      >
                  {item.title}
                      </label>
                <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                  {item.quantity && item.quantity !== "1" && (
                    <span className="bg-secondary px-2 py-0.5 rounded-full">
                      Qty: {item.quantity}
                    </span>
                  )}
                  <span className="bg-secondary px-2 py-0.5 rounded-full">
                    {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                  </span>
                  {currentFamily && (
                    <span className="bg-secondary px-2 py-0.5 rounded-full">
                      {item.family_id ? 'Family' : 'Personal'}
                    </span>
                  )}
                    </div>
                  </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => startEdit(item)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteItem(item.id)}
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

export default GroceriesPage;
