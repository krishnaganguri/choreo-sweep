import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function AboutPage() {
  const features = [
    {
      title: 'Dashboard',
      description: 'Get a quick overview of all your household activities, upcoming tasks, and family updates.',
      guides: [
        'View all your active tasks and reminders at a glance',
        'Quick access to all main features',
        'See family activity updates',
      ]
    },
    {
      title: 'Chores Management',
      description: 'Organize and track household tasks efficiently.',
      guides: [
        'Create new chores with titles, descriptions, and due dates',
        'Assign priorities (low, medium, high)',
        'Mark chores as complete when finished',
        'Receive notifications for upcoming deadlines',
      ]
    },
    {
      title: 'Grocery Lists',
      description: 'Keep track of shopping needs and manage grocery lists.',
      guides: [
        'Create multiple shopping lists',
        'Add items with quantities and notes',
        'Mark items as purchased',
        'Share lists with family members',
      ]
    },
    {
      title: 'Expense Tracking',
      description: 'Monitor and manage household expenses.',
      guides: [
        'Record expenses with dates and categories',
        'Track spending patterns',
        'Categorize expenses for better organization',
        'View expense history and summaries',
      ]
    },
    {
      title: 'Reminders',
      description: 'Never miss important dates and tasks.',
      guides: [
        'Set up reminders for important events',
        'Choose notification preferences',
        'Set priority levels for better organization',
        'Receive notifications at scheduled times',
      ]
    },
    {
      title: 'Family Management',
      description: 'Coordinate with family members effectively.',
      guides: [
        'Create and manage family groups',
        'Invite family members to join',
        'Assign roles and permissions',
        'Share tasks and responsibilities',
      ]
    },
    {
      title: 'Notifications',
      description: 'Stay updated with important alerts and reminders.',
      guides: [
        'Enable browser notifications for updates',
        'Get alerts for upcoming tasks and deadlines',
        'Receive family activity notifications',
        'Customize notification preferences',
      ]
    },
  ];

  return (
    <div className="container max-w-4xl py-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">About MyHomeManager</h1>
          <p className="text-muted-foreground mt-2">
            Your complete solution for household management and family coordination
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome to MyHomeManager</CardTitle>
            <CardDescription>
              MyHomeManager is a comprehensive household management application designed to help families 
              organize their daily tasks, track expenses, manage groceries, and coordinate activities efficiently.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Our platform combines task management, expense tracking, and family coordination tools 
              in one easy-to-use interface, making household management simpler and more efficient.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Features & How-to Guides</h2>
          <ScrollArea className="h-[600px] rounded-md border p-4">
            <Accordion type="single" collapsible className="w-full">
              {features.map((feature, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-lg font-semibold">
                    {feature.title}
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-medium">How to use:</h4>
                      <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
                        {feature.guides.map((guide, guideIndex) => (
                          <li key={guideIndex}>{guide}</li>
                        ))}
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
} 