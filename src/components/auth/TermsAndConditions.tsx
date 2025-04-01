
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Control } from "react-hook-form";

type TermsAndConditionsProps = {
  control: Control<any>;
  name: string;
};

const TermsAndConditions = ({ control, name }: TermsAndConditionsProps) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <p className="text-sm text-muted-foreground">
              I agree to the{" "}
              <a href="#" className="text-primary hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-primary hover:underline">
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
