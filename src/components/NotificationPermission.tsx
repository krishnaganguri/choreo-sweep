import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { NotificationService } from '@/lib/notifications';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const NotificationPermission = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const notificationService = NotificationService.getInstance();

  useEffect(() => {
    // Check if notifications are supported and not already granted
    const checkNotificationPermission = async () => {
      if (!('Notification' in window)) {
        console.log('This browser does not support notifications');
        return;
      }

      // Wait a bit before showing the prompt to ensure other UI elements are loaded
      setTimeout(() => {
        if (Notification.permission === 'default') {
          setShowPrompt(true);
        }
      }, 2000);
    };

    checkNotificationPermission();
  }, []);

  const handleEnableNotifications = async () => {
    try {
      const granted = await notificationService.requestPermission();
      
      if (granted) {
        toast.success('Notifications enabled', {
          description: 'You will now receive notifications for chores and reminders.',
        });
        
        // Send a test notification
        await notificationService.sendNotification(
          'Notifications Enabled',
          {
            body: 'You will now receive notifications for your tasks and reminders.',
            icon: '/logo.png',
          }
        );
      } else {
        toast.error('Notifications disabled', {
          description: 'You can enable notifications later in your browser settings.',
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Failed to enable notifications', {
        description: 'Please try again or check your browser settings.',
      });
    } finally {
      setShowPrompt(false);
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Enable Notifications</CardTitle>
          <CardDescription>
            Stay updated with MyHomeManager
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Get notified about:
          </p>
          <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-2">
            <li>Upcoming chores and their deadlines</li>
            <li>Important reminders and events</li>
            <li>Family updates and invitations</li>
            <li>Task assignments and completions</li>
          </ul>
          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => setShowPrompt(false)}
            >
              Maybe Later
            </Button>
            <Button
              variant="default"
              onClick={handleEnableNotifications}
            >
              Enable Notifications
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 