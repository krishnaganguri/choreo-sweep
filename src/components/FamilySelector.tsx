import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from '@/components/ui/select';
import { Button } from "@/components/ui/button";
import { Plus, User, Users } from "lucide-react";
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

  return (
    <div className="flex items-center gap-2">
      <Select
        value={currentFamily === undefined ? "all" : currentFamily === null ? "personal" : currentFamily.id}
        onValueChange={(value) => {
          if (value === "personal") {
            setCurrentFamily(null);
          } else if (value === "all") {
            setCurrentFamily(undefined);
          } else {
            const family = families.find(f => f.id === value);
            if (family) setCurrentFamily(family);
          }
        }}
      >
        <SelectTrigger className="w-[120px] sm:w-[200px]">
          <SelectValue placeholder="Select view">
            {currentFamily === undefined ? (
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="truncate">All Families</span>
              </span>
            ) : currentFamily === null ? (
              <span className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="truncate">Personal Items</span>
              </span>
            ) : (
              <span className="truncate">{currentFamily.name}</span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>All Families</span>
            </span>
          </SelectItem>
          <SelectItem value="personal">
            <span className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Personal Items</span>
            </span>
          </SelectItem>
          {families.length > 0 && <SelectSeparator />}
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
              <Label htmlFor="name">Family Name</Label>
              <Input
                id="name"
                value={newFamilyName}
                onChange={(e) => setNewFamilyName(e.target.value)}
                placeholder="Enter family name"
              />
            </div>
            <Button type="submit" className="w-full">
              Create Family
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 