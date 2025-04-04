import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth";
import { User, Settings, LogOut, HelpCircle, Mail, Shield, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "./ui/use-toast";

export function ProfileMenu() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Success",
        description: "Signed out successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error signing out",
        variant: "destructive",
      });
    }
  };

  const handleExternalLink = (path: string) => {
    window.open(path, '_blank', 'noopener,noreferrer');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <User className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex items-center gap-2" onClick={() => navigate("/profile")}>
          <User className="h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2" onClick={() => navigate("/settings")}>
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex items-center gap-2" onClick={() => navigate("/about")}>
          <HelpCircle className="h-4 w-4" />
          <span>About</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2" onClick={() => navigate("/contact")}>
          <Mail className="h-4 w-4" />
          <span>Contact</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex items-center gap-2" onClick={() => handleExternalLink('/privacy')}>
          <Shield className="h-4 w-4" />
          <span>Privacy Policy</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2" onClick={() => handleExternalLink('/terms')}>
          <FileText className="h-4 w-4" />
          <span>Terms of Service</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex items-center gap-2" onClick={handleSignOut}>
          <LogOut className="h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 