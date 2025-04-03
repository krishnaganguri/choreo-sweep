import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useFamily } from '@/lib/hooks/useFamily';
import { familyService } from '@/lib/services';

export function FamilySelector() {
  const { toast } = useToast();
  const { currentFamily, families, setCurrentFamily, refreshFamilies } = useFamily();
  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const [newFamilyName, setNewFamilyName] = React.useState("");

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFamilyName.trim()) return;

    try {
      const newFamily = await familyService.createFamily(newFamilyName.trim());
      await refreshFamilies();
      setCurrentFamily(newFamily);
      setShowCreateForm(false);
      setNewFamilyName("");
      toast({
        title: "Success",
        description: "Family created successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create family. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (families.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        value={currentFamily?.id || ""}
        onValueChange={(value) => {
          const family = families.find(f => f.id === value);
          if (family) setCurrentFamily(family);
        }}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select a family" />
        </SelectTrigger>
        <SelectContent>
          {families.map((family) => (
            <SelectItem key={family.id} value={family.id}>
              {family.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Family</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateFamily} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="familyName">Family Name</Label>
              <Input
                id="familyName"
                value={newFamilyName}
                onChange={(e) => setNewFamilyName(e.target.value)}
                placeholder="Enter family name"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Create
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 