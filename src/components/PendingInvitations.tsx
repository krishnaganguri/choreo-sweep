import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { familyService } from '@/lib/services';
import { useFamily } from '@/lib/hooks/useFamily';

interface PendingInvitation {
  id: string;
  family: {
    id: string;
    name: string;
  };
}

export const PendingInvitations = () => {
  const [invitations, setInvitations] = useState<PendingInvitation[]>([]);
  const { toast } = useToast();
  const { refreshFamilies } = useFamily();

  const loadInvitations = async () => {
    try {
      const data = await familyService.getPendingInvitations();
      setInvitations(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load invitations',
        variant: 'destructive',
      });
    }
  };

  const handleAccept = async (familyId: string) => {
    try {
      await familyService.acceptInvitation(familyId);
      await refreshFamilies();
      await loadInvitations();
      toast({
        title: 'Success',
        description: 'Family invitation accepted',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to accept invitation',
        variant: 'destructive',
      });
    }
  };

  const handleDecline = async (familyId: string) => {
    try {
      await familyService.declineInvitation(familyId);
      await loadInvitations();
      toast({
        title: 'Success',
        description: 'Family invitation declined',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to decline invitation',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    loadInvitations();
  }, []);

  if (invitations.length === 0) {
    return null;
  }

  return (
    <Card className="p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Pending Family Invitations</h2>
      <div className="space-y-4">
        {invitations.map((invitation) => (
          <div
            key={invitation.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div>
              <p className="font-medium">
                Invitation to join: {invitation.family.name}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => handleAccept(invitation.family.id)}
              >
                Accept
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDecline(invitation.family.id)}
              >
                Decline
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}; 