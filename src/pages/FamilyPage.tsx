import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { familyService } from '@/lib/services';
import type { Family, FamilyMember } from '@/lib/types';
import { useFamily } from '@/lib/hooks/useFamily';
import { PendingInvitations } from '@/components/PendingInvitations';

export const FamilyPage = () => {
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [members, setMembers] = useState<(FamilyMember & { user: { email: string } })[]>([]);
  const [newFamilyName, setNewFamilyName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const { toast } = useToast();
  const { isAdmin, refreshFamilies, families, currentFamily, setCurrentFamily } = useFamily();

  useEffect(() => {
    if (families.length > 0 && !selectedFamily) {
      setSelectedFamily(families[0]);
    }
  }, [families]);

  useEffect(() => {
    if (selectedFamily) {
      loadFamilyMembers();
    }
  }, [selectedFamily]);

  const loadFamilyMembers = async () => {
    if (!selectedFamily) return;
    try {
      const data = await familyService.getFamilyMembers(selectedFamily.id);
      setMembers(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load family members',
        variant: 'destructive',
      });
    }
  };

  const handleCreateFamily = async () => {
    if (!newFamilyName.trim()) return;
    try {
      const createdFamily = await familyService.createFamily(newFamilyName);
      await refreshFamilies(); // This will update the families list in the context
      setSelectedFamily(createdFamily);
      setCurrentFamily(createdFamily);
      setNewFamilyName('');
      await loadFamilyMembers();
      toast({
        title: 'Success',
        description: 'Family created successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create family',
        variant: 'destructive',
      });
    }
  };

  const handleAddMember = async () => {
    if (!selectedFamily || !newMemberEmail.trim()) return;
    try {
      await familyService.addFamilyMember(
        selectedFamily.id,
        newMemberEmail,
        'member'
      );
      setNewMemberEmail('');
      await loadFamilyMembers();
      toast({
        title: 'Success',
        description: 'Member added successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add member',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateRole = async (memberId: string, role: 'admin' | 'member') => {
    if (!selectedFamily) return;
    try {
      await familyService.updateMemberRole(selectedFamily.id, memberId, role);
      await loadFamilyMembers();
      toast({
        title: 'Success',
        description: 'Role updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update role',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!selectedFamily) return;
    try {
      await familyService.removeFamilyMember(selectedFamily.id, memberId);
      await loadFamilyMembers();
      toast({
        title: 'Success',
        description: 'Member removed successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove member',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Family Management</h1>

      <PendingInvitations />

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Your Families</h2>
          
          <div className="space-y-4">
            <Select
              value={selectedFamily?.id}
              onValueChange={(value) => {
                const family = families.find(f => f.id === value);
                if (family) {
                  setSelectedFamily(family);
                  setCurrentFamily(family);
                }
              }}
            >
              <SelectTrigger>
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

            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full">Create New Family</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Family</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="familyName">Family Name</Label>
                    <Input
                      id="familyName"
                      value={newFamilyName}
                      onChange={(e) => setNewFamilyName(e.target.value)}
                      placeholder="Enter family name"
                    />
                  </div>
                  <Button onClick={handleCreateFamily}>Create</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </Card>

        {selectedFamily && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Family Members</h2>
            
            <div className="space-y-4">
              {isAdmin(selectedFamily.id) && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full">Add Member</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Family Member</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="memberEmail">Member Email</Label>
                        <Input
                          id="memberEmail"
                          type="email"
                          value={newMemberEmail}
                          onChange={(e) => setNewMemberEmail(e.target.value)}
                          placeholder="Enter member email"
                        />
                      </div>
                      <Button onClick={handleAddMember}>Add Member</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              <div className="space-y-4">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{member.display_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {member.user.email}
                      </p>
                      {!member.is_verified && (
                        <p className="text-sm text-yellow-500">
                          Pending verification
                        </p>
                      )}
                    </div>
                    {isAdmin(selectedFamily.id) && (
                      <div className="flex items-center gap-2">
                        <Select
                          value={member.role}
                          onValueChange={(value: 'admin' | 'member') =>
                            handleUpdateRole(member.user_id, value)
                          }
                        >
                          <SelectTrigger className="w-[100px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="member">Member</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveMember(member.user_id)}
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}; 