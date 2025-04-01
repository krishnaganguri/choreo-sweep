
import React, { useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import { Check, Plus, Repeat, CalendarClock, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface Chore {
  id: number;
  title: string;
  completed: boolean;
  recurring: boolean;
  dueDate: string;
}

const ChoresPage = () => {
  // Mock data - in a real app, this would come from state or API
  const [chores, setChores] = useState<Chore[]>([
    { id: 1, title: "Vacuum living room", completed: false, recurring: true, dueDate: "Today" },
    { id: 2, title: "Clean kitchen", completed: false, recurring: true, dueDate: "Tomorrow" },
    { id: 3, title: "Water plants", completed: true, recurring: true, dueDate: "Yesterday" },
    { id: 4, title: "Take out trash", completed: false, recurring: false, dueDate: "Today" },
  ]);

  const toggleChoreCompletion = (id: number) => {
    setChores(prevChores =>
      prevChores.map(chore =>
        chore.id === id ? { ...chore, completed: !chore.completed } : chore
      )
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-chores">Chores</h1>
            <p className="text-muted-foreground">
              Manage your household tasks
            </p>
          </div>
          <Button className="bg-chores hover:bg-chores/90">
            <Plus className="mr-2 h-4 w-4" /> Add Task
          </Button>
        </div>

        <div className="flex gap-2 overflow-x-auto py-2">
          <Button variant="outline" className="flex gap-1 whitespace-nowrap">
            <ArrowUpDown className="h-4 w-4" /> Sort
          </Button>
          <Button variant="outline" className="flex gap-1 whitespace-nowrap">
            <CalendarClock className="h-4 w-4" /> Due Date
          </Button>
          <Button variant="outline" className="flex gap-1 whitespace-nowrap">
            <Repeat className="h-4 w-4" /> Recurring
          </Button>
          <Button variant="outline" className="flex gap-1 whitespace-nowrap">
            <Check className="h-4 w-4" /> Completed
          </Button>
        </div>

        <div className="space-y-3">
          {chores.map((chore) => (
            <div
              key={chore.id}
              className={`card-container flex items-center gap-3 ${
                chore.completed ? "opacity-60" : ""
              }`}
            >
              <Checkbox
                id={`chore-${chore.id}`}
                checked={chore.completed}
                onCheckedChange={() => toggleChoreCompletion(chore.id)}
                className="border-chores"
              />
              <div className="flex-1">
                <label
                  htmlFor={`chore-${chore.id}`}
                  className={`font-medium cursor-pointer ${
                    chore.completed ? "line-through" : ""
                  }`}
                >
                  {chore.title}
                </label>
                <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                  <span className="bg-secondary px-2 py-0.5 rounded-full">
                    {chore.dueDate}
                  </span>
                  {chore.recurring && (
                    <span className="bg-secondary flex items-center gap-1 px-2 py-0.5 rounded-full">
                      <Repeat className="h-3 w-3" /> Recurring
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default ChoresPage;
