import React from 'react';
import { Progress } from '@/components/ui/progress';

interface PasswordStrengthIndicatorProps {
  password: string;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
  const calculateStrength = (password: string): number => {
    let strength = 0;
    
    if (password.length >= 8) strength += 25;
    if (password.match(/[A-Z]/)) strength += 25;
    if (password.match(/[a-z]/)) strength += 25;
    if (password.match(/[0-9]/)) strength += 25;
    
    return strength;
  };

  const getStrengthText = (strength: number): string => {
    if (strength === 0) return 'Very Weak';
    if (strength <= 25) return 'Weak';
    if (strength <= 50) return 'Fair';
    if (strength <= 75) return 'Good';
    return 'Strong';
  };

  const getStrengthColor = (strength: number): string => {
    if (strength === 0) return 'bg-destructive';
    if (strength <= 25) return 'bg-destructive';
    if (strength <= 50) return 'bg-yellow-500';
    if (strength <= 75) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const strength = calculateStrength(password);

  return (
    <div className="space-y-2">
      <Progress 
        value={strength} 
        className={`h-2 ${getStrengthColor(strength)}`}
      />
      <p className="text-xs text-muted-foreground">
        Password Strength: {getStrengthText(strength)}
      </p>
    </div>
  );
};

export default PasswordStrengthIndicator;
