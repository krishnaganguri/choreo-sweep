
import React from "react";

type PasswordStrengthIndicatorProps = {
  password: string;
};

const PasswordStrengthIndicator = ({ password }: PasswordStrengthIndicatorProps) => {
  // Calculate password strength
  const getStrength = (password: string): number => {
    let strength = 0;
    
    if (password.length >= 8) strength += 1;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 1;
    if (password.match(/[0-9]/)) strength += 1;
    if (password.match(/[^a-zA-Z0-9]/)) strength += 1;
    
    return strength;
  };

  const strength = getStrength(password);
  
  // Map strength to label and color
  const getLabel = (strength: number): string => {
    switch (strength) {
      case 0: return "Too weak";
      case 1: return "Weak";
      case 2: return "Fair";
      case 3: return "Good";
      case 4: return "Strong";
      default: return "";
    }
  };

  const getColor = (strength: number): string => {
    switch (strength) {
      case 0: return "bg-red-500";
      case 1: return "bg-orange-500";
      case 2: return "bg-yellow-500";
      case 3: return "bg-blue-500";
      case 4: return "bg-green-500";
      default: return "bg-gray-200";
    }
  };

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1">
      <div className="flex h-1.5 w-full gap-1">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`h-full flex-1 rounded-full transition-colors ${
              i < strength ? getColor(strength) : "bg-gray-200"
            }`}
          />
        ))}
      </div>
      <p className={`text-xs ${strength > 2 ? "text-green-600" : "text-muted-foreground"}`}>
        {getLabel(strength)}
      </p>
    </div>
  );
};

export default PasswordStrengthIndicator;
