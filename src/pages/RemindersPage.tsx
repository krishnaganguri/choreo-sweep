
import React, { useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import { Plus, Calendar, Clock, Bell, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface Reminder {
  id: number;
  title: string;
  date: string;
  time: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
}

const RemindersPage = () => {
  // Mock data - in a real app, this would come from state or API
  const [reminders, setReminders] = useState<Reminder[]>([
    { 
      id: 1, 
      title: "Pay rent", 
      date: "2023-05-01", 
      time: "09:00", 
      completed: false,
      priority: "high" 
    },
    { 
      id: 2, 
      title: "Doctor appointment", 
      date: "2023-04-15", 
      time: "14:30", 
      completed: false,
      priority: "medium" 
    },
    { 
      id: 3, 
      title: "Call mom", 
      date: "2023-04-12", 
      time: "18:00", 
      completed: true,
      priority: "medium" 
    },
  ]);

  const toggleReminderCompletion = (id: number) => {
    setReminders(prevReminders =>
      prevReminders.map(reminder =>
        reminder.id === id ? { ...reminder, completed: !reminder.completed } : reminder
      )
    );
  };

  const priorityColors = {
    low: "bg-blue-100 text-blue-800",
    medium: "bg-orange-100 text-orange-800",
    high: "bg-red-100 text-red-800"
  };

  // Filter reminders by status
  const upcomingReminders = reminders.filter(reminder => !reminder.completed);
  const completedReminders = reminders.filter(reminder => reminder.completed);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-reminders">Reminders</h1>
            <p className="text-muted-foreground">
              Never miss an important date
            </p>
          </div>
          <Button className="bg-reminders hover:bg-reminders/90">
            <Plus className="mr-2 h-4 w-4" /> Add Reminder
          </Button>
        </div>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming" className="relative">
              Upcoming
              {upcomingReminders.length > 0 && (
                <Badge className="ml-2 bg-reminders">
                  {upcomingReminders.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming" className="mt-4 space-y-4">
            {upcomingReminders.length === 0 ? (
              <Card className="p-6 text-center">
                <Bell className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-3" />
                <h3 className="font-medium text-lg">No upcoming reminders</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Add a reminder to get started
                </p>
              </Card>
            ) : (
              upcomingReminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="card-container"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-lg">{reminder.title}</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(reminder.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 mr-1" />
                          {reminder.time}
                        </div>
                        <Badge className={`${priorityColors[reminder.priority]}`}>
                          {reminder.priority}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => toggleReminderCompletion(reminder.id)}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="mt-4 space-y-4">
            {completedReminders.length === 0 ? (
              <Card className="p-6 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-3" />
                <h3 className="font-medium text-lg">No completed reminders</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Complete a reminder to see it here
                </p>
              </Card>
            ) : (
              completedReminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="card-container opacity-70"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-lg line-through">{reminder.title}</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(reminder.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 mr-1" />
                          {reminder.time}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => toggleReminderCompletion(reminder.id)}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default RemindersPage;
