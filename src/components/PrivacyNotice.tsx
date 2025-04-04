import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

export function PrivacyNotice() {
  const [showNotice, setShowNotice] = useState(false);

  useEffect(() => {
    const hasAccepted = localStorage.getItem('privacy-accepted');
    if (!hasAccepted) {
      setShowNotice(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('privacy-accepted', 'true');
    setShowNotice(false);
  };

  const handleExternalLink = (path: string) => {
    window.open(path, '_blank', 'noopener,noreferrer');
  };

  if (!showNotice) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/80 backdrop-blur-sm">
      <Card className="max-w-2xl mx-auto shadow-lg border-t-4 border-t-primary">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Privacy Notice</CardTitle>
          <CardDescription className="text-base">
            We value your privacy and want to be transparent about how we use your data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We use cookies and similar technologies to improve your experience, analyze traffic, and personalize content. 
            By using MyHomeManager, you agree to our{' '}
            <button
              onClick={() => handleExternalLink('/privacy')}
              className="inline-flex items-center gap-1 font-medium underline hover:text-primary transition-colors"
            >
              Privacy Policy
              <ExternalLink className="h-3 w-3" />
            </button>{' '}
            and{' '}
            <button
              onClick={() => handleExternalLink('/terms')}
              className="inline-flex items-center gap-1 font-medium underline hover:text-primary transition-colors"
            >
              Terms of Service
              <ExternalLink className="h-3 w-3" />
            </button>
            .
          </p>
        </CardContent>
        <CardFooter className="flex justify-end gap-4">
          <Button 
            variant="outline" 
            onClick={() => handleExternalLink('/privacy')}
            className="inline-flex items-center gap-2"
          >
            Learn More
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button onClick={handleAccept} className="px-6">Accept</Button>
        </CardFooter>
      </Card>
    </div>
  );
} 