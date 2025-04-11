import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
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
import { useToast } from '@/components/ui/use-toast';
import { familyService } from '@/lib/services';
import { useFamily } from '@/lib/hooks/useFamily';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// Define types for better type safety
interface Member {
  id: string;
  user_id: string;
  display_name: string;
  profile: {
    email: string;
  };
  role: 'admin' | 'member';
  features_allowed: string[];
}

export const FamilyPage = () => {
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [newFamilyName, setNewFamilyName] = useState('');
  const [showCreateFamilyDialog, setShowCreateFamilyDialog] = useState(false);
  const [addMemberError, setAddMemberError] = useState<string | null>(null);
  const { toast } = useToast();
  const { family, isAdmin, refreshFamily } = useFamily();
  const queryClient = useQueryClient();

  // Query for family members
  const { data: members = [] } = useQuery<Member[]>({
    queryKey: ['familyMembers', family?.id],
    queryFn: () => family ? familyService.getFamilyMembers(family.id) : [],
    enabled: !!family,
  });

  // Mutations
  const createFamilyMutation = useMutation({
    mutationFn: (name: string) => familyService.createFamily(name),
    onSuccess: async () => {
      setNewFamilyName('');
      setShowCreateFamilyDialog(false);
      await refreshFamily();
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

  const addMemberMutation = useMutation({
    mutationFn: ({ familyId, email }: { familyId: string; email: string }) =>
      familyService.addFamilyMember(familyId, email, 'member'),
    onSuccess: async () => {
      setNewMemberEmail('');
      setAddMemberError(null);
      setShowAddMemberDialog(false);
      await queryClient.invalidateQueries({ queryKey: ['familyMembers', family?.id] });
      toast({
        title: 'Success',
        description: 'Member added successfully',
      });
    },
    onError: (error: Error) => {
      let description = 'Failed to add member. Please try again.';
      if (error.message === 'USER_NOT_FOUND') {
        description = `User with email ${newMemberEmail} not found. Please ask them to sign up first.`;
      } else if (error.message.includes('already a member')) {
        description = 'This user is already a member of this family.';
      } else if (error.message) {
        description = error.message;
      } 
      setAddMemberError(description);
    },
  });

  const updateFeatureAccessMutation = useMutation({
    mutationFn: ({ familyId, userId, features }: { familyId: string; userId: string; features: string[] }) =>
      familyService.updateMemberFeatures(familyId, userId, features),
    onSuccess: (_, { userId, features }) => {
      queryClient.setQueryData(['familyMembers', family?.id], (old: Member[] = []) =>
        old.map(m => m.user_id === userId ? { ...m, features_allowed: features } : m)
      );
      toast({ title: 'Success', description: 'Feature access updated' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update features', variant: 'destructive' });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: ({ familyId, userId }: { familyId: string; userId: string }) =>
      familyService.removeFamilyMember(familyId, userId),
    onSuccess: (_, { userId }) => {
      queryClient.setQueryData(['familyMembers', family?.id], (old: Member[] = []) =>
        old.filter(m => m.user_id !== userId)
      );
      toast({ title: 'Success', description: 'Member removed successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to remove member', variant: 'destructive' });
    },
  });

  // Handlers
  const handleCreateFamily = () => {
    if (!newFamilyName.trim()) return;
    createFamilyMutation.mutate(newFamilyName);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    setAddMemberError(null);
    if (!family || !newMemberEmail) return;
    addMemberMutation.mutate({ familyId: family.id, email: newMemberEmail });
  };

  const handleUpdateFeatureAccess = (userId: string, feature: string, enabled: boolean) => {
    if (!family) return;
    const member = members.find(m => m.user_id === userId);
    if (!member) return;

    const updatedFeatures = enabled
      ? [...(member.features_allowed || []), feature]
      : (member.features_allowed || []).filter((f: string) => f !== feature);

    updateFeatureAccessMutation.mutate({
      familyId: family.id,
      userId,
      features: updatedFeatures,
    });
  };

  const availableFeatures = ['chores', 'groceries', 'expenses', 'reminders'];

  if (!family) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Family Management</h1>
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Join or Create a Family</h2>
          <p className="text-muted-foreground mb-4">
            You currently don't belong to any family. Please contact a family admin to receive an invitation.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Family Management</h1>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Family Members</CardTitle>
          {isAdmin && (
            <Dialog 
              open={showAddMemberDialog} 
              onOpenChange={(open) => {
                setShowAddMemberDialog(open);
                if (!open) {
                  setNewMemberEmail('');
                  setAddMemberError(null);
                }
              }}
            >
              <DialogTrigger asChild>
                <Button>Add Member</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Family Member</DialogTitle>
                  <DialogDescription>
                    Add a new member by entering their email address. They must have already signed up.
                  </DialogDescription>
                </DialogHeader>
                
                {addMemberError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{addMemberError}</AlertDescription>
                  </Alert>
                )}
                
                <form onSubmit={handleAddMember} className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="member-email">Member Email</Label>
                    <Input
                      id="member-email"
                      type="email"
                      value={newMemberEmail}
                      onChange={(e) => {
                        setNewMemberEmail(e.target.value);
                        setAddMemberError(null);
                      }}
                      placeholder="Enter member's email"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddMemberDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={addMemberMutation.isPending}>
                      {addMemberMutation.isPending ? 'Adding...' : 'Add Member'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {members.map((member) => (
            <Card key={member.user_id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div className="flex-1">
                <p className="font-semibold">{member.display_name}</p>
                <p className="text-sm text-muted-foreground">{member.profile?.email}</p>
                <p className="text-xs text-muted-foreground">Role: {member.role}</p>
              </div>
              {isAdmin && member.role !== 'admin' && (
                <div className="space-y-2">
                  <p className="text-sm font-medium mb-2">Feature Access:</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {availableFeatures.map((feature) => (
                      <div key={feature} className="flex items-center space-x-2">
                        <Switch
                          id={`${member.user_id}-${feature}`}
                          checked={member.features_allowed?.includes(feature)}
                          onCheckedChange={(checked) =>
                            handleUpdateFeatureAccess(member.user_id, feature, checked)
                          }
                        />
                        <Label htmlFor={`${member.user_id}-${feature}`} className="capitalize">
                          {feature}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {isAdmin && member.role !== 'admin' && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">Remove</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently remove 
                        <span className="font-semibold"> {member.display_name} </span> 
                        from the family.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                         className="bg-destructive hover:bg-destructive/90"
                         onClick={() => {
                           if (family) { 
                              removeMemberMutation.mutate({ familyId: family.id, userId: member.user_id })
                           }
                         }}
                      >
                        Confirm Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}; 