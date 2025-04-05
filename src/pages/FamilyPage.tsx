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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const FamilyPage = () => {
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [members, setMembers] = useState<(FamilyMember & { user: { email: string } })[]>([]);
  const [newFamilyName, setNewFamilyName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [showCreateFamilyDialog, setShowCreateFamilyDialog] = useState(false);
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [showEditFamilyDialog, setShowEditFamilyDialog] = useState(false);
  const { toast } = useToast();
  const { isAdmin, refreshFamilies, families, currentFamily, setCurrentFamily } = useFamily();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (families.length > 0) {
      // Always set the selected family if we have families but no selection
      if (!selectedFamily) {
        const family = families[0];
        setSelectedFamily(family);
        setCurrentFamily(family);
      }
      // If we have exactly one family, ensure it's selected
      if (families.length === 1) {
        const family = families[0];
        setSelectedFamily(family);
        setCurrentFamily(family);
      }
    }
  }, [families, selectedFamily]);

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

  // Query for family members
  const { data: membersData = [] } = useQuery({
    queryKey: ['familyMembers', selectedFamily?.id],
    queryFn: () => selectedFamily ? familyService.getFamilyMembers(selectedFamily.id) : [],
    enabled: !!selectedFamily,
  });

  // Mutations
  const createFamilyMutation = useMutation({
    mutationFn: (name: string) => familyService.createFamily(name),
    onSuccess: async (createdFamily) => {
      setSelectedFamily(createdFamily);
      setCurrentFamily(createdFamily);
      setNewFamilyName('');
      setShowCreateFamilyDialog(false);
      await queryClient.invalidateQueries({ queryKey: ['families'] });
      toast({
        title: 'Success',
        description: 'Family created successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create family',
        variant: 'destructive',
      });
    },
  });

  const updateFamilyMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => 
      familyService.updateFamily(id, name),
    onSuccess: async () => {
      setNewFamilyName('');
      setShowEditFamilyDialog(false);
      await queryClient.invalidateQueries({ queryKey: ['families'] });
      toast({
        title: 'Success',
        description: 'Family updated successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update family',
        variant: 'destructive',
      });
    },
  });

  const deleteFamilyMutation = useMutation({
    mutationFn: (id: string) => familyService.deleteFamily(id),
    onSuccess: async () => {
      setSelectedFamily(null);
      setCurrentFamily(null);
      setNewFamilyName('');
      await queryClient.invalidateQueries({ queryKey: ['families'] });
      toast({
        title: 'Success',
        description: 'Family deleted successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete family',
        variant: 'destructive',
      });
    },
  });

  const addMemberMutation = useMutation({
    mutationFn: ({ familyId, email }: { familyId: string; email: string }) =>
      familyService.addFamilyMember(familyId, email, 'member'),
    onSuccess: async () => {
      setNewMemberEmail('');
      setShowAddMemberDialog(false);
      await queryClient.invalidateQueries({ queryKey: ['familyMembers', selectedFamily?.id] });
      toast({
        title: 'Success',
        description: 'Member added successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to add member',
        variant: 'destructive',
      });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ familyId, userId, role }: { familyId: string; userId: string; role: 'admin' | 'member' }) =>
      familyService.updateMemberRole(familyId, userId, role),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['familyMembers', selectedFamily?.id] });
      toast({
        title: 'Success',
        description: 'Role updated successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update role',
        variant: 'destructive',
      });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: ({ familyId, userId }: { familyId: string; userId: string }) =>
      familyService.removeFamilyMember(familyId, userId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['familyMembers', selectedFamily?.id] });
      toast({
        title: 'Success',
        description: 'Member removed successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to remove member',
        variant: 'destructive',
      });
    },
  });

  // Handlers
  const handleCreateFamily = () => {
    if (!newFamilyName.trim()) return;
    createFamilyMutation.mutate(newFamilyName);
  };

  const handleUpdateFamily = () => {
    if (!selectedFamily || !newFamilyName.trim()) return;
    updateFamilyMutation.mutate({ id: selectedFamily.id, name: newFamilyName });
  };

  const handleDeleteFamily = () => {
    if (!selectedFamily) return;
    deleteFamilyMutation.mutate(selectedFamily.id);
  };

  const handleAddMember = () => {
    if (!selectedFamily || !newMemberEmail.trim()) return;
    addMemberMutation.mutate({ familyId: selectedFamily.id, email: newMemberEmail });
  };

  const handleUpdateRole = (userId: string, role: 'admin' | 'member') => {
    if (!selectedFamily) return;
    updateRoleMutation.mutate({ familyId: selectedFamily.id, userId, role });
  };

  const handleRemoveMember = (userId: string) => {
    if (!selectedFamily) return;
    removeMemberMutation.mutate({ familyId: selectedFamily.id, userId });
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Family Management</h1>

      <PendingInvitations />

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Your Families</h2>
          
          <div className="space-y-4">
            <div className="flex flex-col gap-4">
              {families.length > 0 && (
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
                  <SelectTrigger className="w-full">
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
              )}

              <Dialog open={showCreateFamilyDialog} onOpenChange={setShowCreateFamilyDialog}>
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
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowCreateFamilyDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateFamily}>Create</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {selectedFamily && (
                <div className="flex gap-2">
                  <Dialog open={showEditFamilyDialog} onOpenChange={setShowEditFamilyDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex-1">Edit</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Family</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="editFamilyName">Family Name</Label>
                          <Input
                            id="editFamilyName"
                            value={newFamilyName}
                            onChange={(e) => setNewFamilyName(e.target.value)}
                            placeholder="Enter new family name"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowEditFamilyDialog(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleUpdateFamily}>Update</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="flex-1">Delete</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the family
                          and remove all associated data including chores, groceries, expenses, and reminders.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteFamily}>
                          Delete Family
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>
          </div>
        </Card>

        {selectedFamily && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Family Members</h2>
            
            <div className="space-y-4">
              {isAdmin(selectedFamily.id) && (
                <Dialog open={showAddMemberDialog} onOpenChange={setShowAddMemberDialog}>
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
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowAddMemberDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddMember}>Add Member</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {membersData.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-2 bg-muted rounded">
                  <div>
                    <p className="font-medium">{member.display_name}</p>
                    <p className="text-sm text-muted-foreground">{member.user.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!member.is_verified && (
                      <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                        Pending
                      </span>
                    )}
                    {isAdmin(selectedFamily.id) && (
                      <>
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
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}; 