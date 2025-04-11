import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function AboutPage() {
  const features = [
    {
      title: 'Dashboard',
      description: 'Get a quick overview of all your household activities. Toggle between All, Personal, and Family views.',
      guides: [
        'View counts of pending chores, needed groceries, expenses, and active reminders',
        'Toggle between All, Personal, and Family views using the tabs',
        'Quickly navigate to each feature section by clicking the cards',
      ]
    },
    {
      title: 'Chores Management',
      description: 'Organize and track household tasks for your family.',
      guides: [
        'Create new chores with titles, descriptions, and due dates',
        'Assign chores to specific family members (or yourself)',
        'Set chores as recurring (daily, weekly, monthly)',
        'Mark chores as complete when finished',
        'Admins can delete completed chores',
      ]
    },
    {
      title: 'Grocery List',
      description: 'Keep track of shopping needs for yourself or the family.',
      guides: [
        'Add items with names and quantities',
        'Toggle items between Personal (only you see) and Family (shared)',
        'Mark items as purchased by checking them off',
        'Sort items by name',
        'Delete items individually or clear all purchased items',
      ]
    },
    {
      title: 'Expense Tracking',
      description: 'Monitor and manage household or personal expenses.',
      guides: [
        'Record expenses with titles, amounts, dates, and categories',
        'Mark expenses as Personal or Family',
        'Track payment status (paid/unpaid)',
        'Sort expenses by date, amount, or category',
        'Edit or delete expenses',
      ]
    },
    {
      title: 'Reminders',
      description: 'Set personal or family reminders for important dates and tasks.',
      guides: [
        'Create reminders with titles, descriptions, due date/time, and priority (low, medium, high)',
        'Switch between Personal and Family reminder views using tabs',
        'In Family view, toggle reminders as Personal (visible only to you) or Family (shared)',
        'Mark reminders as complete',
        'Sort reminders by due date or priority',
        'Receive browser notifications when reminders are due (if enabled)',
      ]
    },
    {
      title: 'Family Management',
      description: 'Manage your family group and member access.',
      guides: [
        'View current family members and their roles (Admin/Member)',
        'Admins can add new members by email (user must already have an account)',
        'Admins can remove members (with confirmation)',
        'Admins can enable/disable specific feature access (Chores, Groceries, etc.) for each member',
      ]
    },
    {
      title: 'Notifications',
      description: 'Stay updated with important alerts for chores and reminders.',
      guides: [
        'Enable browser notifications in your settings (if prompted)',
        'Get alerts when chores or reminders are due',
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