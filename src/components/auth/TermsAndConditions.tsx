import React from 'react';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Control } from 'react-hook-form';

interface TermsAndConditionsProps {
  control: Control<any>;
  name: string;
}

const TermsAndConditions: React.FC<TermsAndConditionsProps> = ({ control, name }) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <p className="text-sm text-muted-foreground">
              By creating an account, you agree to our{' '}
              <a
                href="/terms"
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Terms of Service
              </a>
              {' '}and{' '}
              <a
                href="/privacy"
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Privacy Policy
              </a>
            </p>
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
};

export default TermsAndConditions;
