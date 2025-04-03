import React, { useState, useEffect } from "react";
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

const GroceriesPage = () => {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [category, setCategory] = useState<string>("other");
  const [isPersonal, setIsPersonal] = useState(false);
  const { toast } = useToast();
  const { currentFamily } = useFamily();
  const { sortConfig, handleSort, getSortedItems } = useSortableList<'name' | 'category'>('name');
  const [editingItem, setEditingItem] = useState<GroceryItem | null>(null);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const data = await groceriesService.getGroceryItems();
      setItems(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load grocery items. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sortedItems = getSortedItems(items, 'completed', (a, b, sortBy, sortOrder) => {
    switch (sortBy) {
      case 'name':
        return sortOrder === 'asc' 
          ? (a.name || '').localeCompare(b.name || '')
          : (b.name || '').localeCompare(a.name || '');
      case 'category':
        return sortOrder === 'asc'
          ? (a.category || 'other').localeCompare(b.category || 'other')
          : (b.category || 'other').localeCompare(a.category || 'other');
      default:
        return 0;
    }
  });

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    try {
      const newItem = await groceriesService.addGroceryItem({
        name,
        quantity,
        category,
        completed: false,
        is_personal: isPersonal,
        family_id: !isPersonal ? currentFamily?.id : undefined
      });
      setItems([newItem, ...items]);
      setShowForm(false);
      resetForm();
      toast({
        title: "Success",
        description: "Item added successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !name) return;

    try {
      const updatedItem = await groceriesService.updateGroceryItem(editingItem.id, {
        name,
        quantity,
        category,
        is_personal: isPersonal,
        family_id: !isPersonal ? currentFamily?.id : undefined
      });

      setItems(items.map(item => item.id === editingItem.id ? updatedItem : item));
      setShowForm(false);
      resetForm();
      toast({
        title: "Success",
        description: "Item updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const startEdit = (item: GroceryItem) => {
    setEditingItem(item);
    setName(item.name);
    setQuantity(item.quantity);
    setCategory(item.category);
    setIsPersonal(!item.family_id);
    setShowForm(true);
  };

  const resetForm = () => {
    setName("");
    setQuantity("1");
    setCategory("other");
    setIsPersonal(false);
    setEditingItem(null);
  };

  const toggleItemCompletion = async (id: number) => {
    try {
      const item = items.find(i => i.id === id);
      if (!item) return;

      const updatedItem = await groceriesService.updateGroceryItem(id, {
        completed: !item.completed
      });

      setItems(items.map(i => i.id === id ? updatedItem : i));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteItem = async (id: number) => {
    try {
      await groceriesService.deleteGroceryItem(id);
      setItems(items.filter(i => i.id !== id));
      toast({
        title: "Success",
        description: "Item deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete item. Please try again.",
        variant: "destructive",
      });
    }
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

  if (loading) {
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
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
          className={`flex gap-1 whitespace-nowrap ${sortConfig.sortBy === 'name' ? 'bg-secondary' : ''}`}
          onClick={() => handleSort('name')}
        >
          <ArrowUpDown className="h-4 w-4" /> 
          Name {sortConfig.sortBy === 'name' && (sortConfig.sortOrder === 'asc' ? '↑' : '↓')}
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
        {sortedItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No items yet. Add your first item to get started!
          </div>
        ) : (
          sortedItems.map((item) => (
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
                  {item.name}
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
