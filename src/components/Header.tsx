import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/hooks/useAuth';
import { UserNav } from './UserNav';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus } from 'lucide-react';

export function Header() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">MyHomeManager</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-2">
          {user && (
            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate('/chores/new')}>
                    New Chore
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/groceries/new')}>
                    New Grocery Item
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/expenses/new')}>
                    New Expense
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/reminders/new')}>
                    New Reminder
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <UserNav />
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 