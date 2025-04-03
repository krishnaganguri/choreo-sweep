import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { NotificationService } from '@/lib/notifications';
import { useToast } from '@/components/ui/use-toast';

export const NotificationPermission = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const { toast } = useToast();
  const notificationService = NotificationService.getInstance();

  useEffect(() => {
    // Check if notifications are supported and not already granted
    if ('Notification' in window && Notification.permission === 'default') {
      setShowPrompt(true);
    }
  }, []);

  const handleEnableNotifications = async () => {
    const granted = await notificationService.requestPermission();
    
    if (granted) {
      toast({
        title: 'Notifications enabled',
        description: 'You will now receive notifications for chores and reminders.',
      });
    } else {
      toast({
        title: 'Notifications disabled',
        description: 'You can enable notifications later in your browser settings.',
        variant: 'destructive',
      });
    }
    
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-sm p-6 bg-card rounded-lg shadow-lg border">
      <h3 className="font-semibold mb-2">Enable Notifications</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Get notified about upcoming chores and reminders to stay on top of your tasks.
      </p>
      <div className="flex gap-3">
        <Button
          variant="default"
          onClick={handleEnableNotifications}
        >
          Enable
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowPrompt(false)}
        >
          Maybe Later
        </Button>
      </div>
    </div>
  );
}; 