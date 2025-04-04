import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Mail, MessageSquare, Github } from 'lucide-react';

export default function ContactPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send the message to your backend
    toast.success('Message sent', {
      description: 'Thank you for your message. We will get back to you soon.',
    });
    // Reset form
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="container max-w-4xl py-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contact Us</h1>
          <p className="text-muted-foreground mt-2">
            Get in touch with our team for support or feedback
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Send us a message</CardTitle>
              <CardDescription>
                Fill out the form below and we'll get back to you as soon as possible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="What is your message about?"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Type your message here..."
                    className="min-h-[100px]"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Other ways to reach us</CardTitle>
                <CardDescription>
                  Choose the method that works best for you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">Email Support</h3>
                    <p className="text-sm text-muted-foreground">
                      support@myhomemanager.com
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">Live Chat</h3>
                    <p className="text-sm text-muted-foreground">
                      Available Monday to Friday, 9am-5pm EST
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Github className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">GitHub Issues</h3>
                    <p className="text-sm text-muted-foreground">
                      Report technical issues on our GitHub repository
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>FAQ</CardTitle>
                <CardDescription>
                  Common questions and answers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium">How do I reset my password?</h3>
                  <p className="text-sm text-muted-foreground">
                    Click on the "Forgot password?" link on the login page to receive a password reset email.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Can I use MyHomeManager on mobile?</h3>
                  <p className="text-sm text-muted-foreground">
                    Yes! MyHomeManager is a Progressive Web App that works on all devices.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">How do I invite family members?</h3>
                  <p className="text-sm text-muted-foreground">
                    Go to the Family page and use the "Invite Member" button to send invitations.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 