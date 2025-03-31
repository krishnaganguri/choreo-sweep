
import React, { useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import { Plus, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface GroceryItem {
  id: number;
  name: string;
  checked: boolean;
  category: string;
  quantity: number;
}

const GroceriesPage = () => {
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([
    { id: 1, name: "Milk", checked: false, category: "Dairy", quantity: 1 },
    { id: 2, name: "Eggs", checked: false, category: "Dairy", quantity: 12 },
    { id: 3, name: "Bread", checked: true, category: "Bakery", quantity: 1 },
    { id: 4, name: "Apples", checked: false, category: "Produce", quantity: 6 },
    { id: 5, name: "Chicken Breast", checked: false, category: "Meat", quantity: 2 },
    { id: 6, name: "Pasta", checked: false, category: "Pantry", quantity: 1 },
    { id: 7, name: "Tomatoes", checked: false, category: "Produce", quantity: 4 },
    { id: 8, name: "Cereal", checked: true, category: "Pantry", quantity: 1 },
    { id: 9, name: "Yogurt", checked: false, category: "Dairy", quantity: 3 },
    { id: 10, name: "Bananas", checked: false, category: "Produce", quantity: 5 },
    { id: 11, name: "Coffee", checked: false, category: "Pantry", quantity: 1 },
    { id: 12, name: "Toilet Paper", checked: false, category: "Household", quantity: 1 },
  ]);

  const [newItem, setNewItem] = useState("");

  const toggleItem = (id: number) => {
    setGroceryItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const addItem = () => {
    if (newItem.trim() !== "") {
      const newItemObj: GroceryItem = {
        id: Date.now(),
        name: newItem,
        checked: false,
        category: "Uncategorized",
        quantity: 1
      };
      setGroceryItems(prev => [...prev, newItemObj]);
      setNewItem("");
    }
  };

  const deleteCheckedItems = () => {
    setGroceryItems(prevItems => prevItems.filter(item => !item.checked));
  };

  // Group items by category
  const groupedItems = groceryItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, GroceryItem[]>);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-groceries">Groceries</h1>
            <p className="text-muted-foreground">
              Manage your shopping list
            </p>
          </div>
          {groceryItems.some(item => item.checked) && (
            <Button 
              variant="outline" 
              className="text-destructive"
              onClick={deleteCheckedItems}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete checked
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Add an item..."
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addItem();
              }
            }}
            className="flex-1"
          />
          <Button className="bg-groceries hover:bg-groceries/90" onClick={addItem}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category} className="card-container">
              <div className="flex items-center mb-2">
                <ShoppingBag className="h-4 w-4 mr-2 text-groceries" />
                <h3 className="font-semibold">{category}</h3>
                <span className="ml-2 text-xs text-muted-foreground">
                  ({items.length} {items.length === 1 ? 'item' : 'items'})
                </span>
              </div>
              <Separator className="my-2" />
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center">
                    <Checkbox
                      id={`item-${item.id}`}
                      checked={item.checked}
                      onCheckedChange={() => toggleItem(item.id)}
                      className="border-groceries"
                    />
                    <div className="ml-3 flex-1">
                      <label
                        htmlFor={`item-${item.id}`}
                        className={`font-medium cursor-pointer ${
                          item.checked ? "line-through text-muted-foreground" : ""
                        }`}
                      >
                        {item.name}
                      </label>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      x{item.quantity}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default GroceriesPage;
