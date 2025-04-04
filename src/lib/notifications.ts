export class NotificationService {
  private static instance: NotificationService;
  private hasPermission: boolean = false;

  private constructor() {
    this.checkPermission();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async checkPermission(): Promise<void> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return;
    }

    if (Notification.permission === 'granted') {
      this.hasPermission = true;
    }
  }

  public async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    try {
      // Request permission and wait for the response
      const permission = await Notification.requestPermission();
      this.hasPermission = permission === 'granted';
      return this.hasPermission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  public async sendNotification(
    title: string,
    options: NotificationOptions = {}
  ): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    try {
      // If we don't have permission, try to request it
      if (!this.hasPermission) {
        const granted = await this.requestPermission();
        if (!granted) {
          console.warn('Notification permission not granted');
          return false;
        }
      }

      // Create and show the notification
      const notification = new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        ...options,
      });

      // Add click handler to focus the window
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }

  public scheduleNotification(
    title: string,
    scheduledTime: Date,
    options: NotificationOptions = {}
  ): void {
    const now = new Date();
    const delay = scheduledTime.getTime() - now.getTime();

    if (delay <= 0) {
      console.warn('Cannot schedule notification in the past');
      return;
    }

    setTimeout(() => {
      this.sendNotification(title, options);
    }, delay);
  }

  public async isSupported(): Promise<boolean> {
    return 'Notification' in window;
  }

  public async getPermissionStatus(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }
} 