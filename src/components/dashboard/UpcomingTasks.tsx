
import React from "react";
import { CalendarClock } from "lucide-react";

interface Task {
  id: number;
  title: string;
  due: string;
  priority: "low" | "medium" | "high";
}

// Mock data - in a real app this would come from an API
const mockTasks: Task[] = [
  {
    id: 1,
    title: "Pay rent",
    due: "Today",
    priority: "high"
  },
  {
    id: 2,
    title: "Water plants",
    due: "Tomorrow",
    priority: "medium"
  },
  {
    id: 3,
    title: "Vacuum living room",
    due: "In 2 days",
    priority: "low"
  },
  {
    id: 4,
    title: "Call plumber",
    due: "Thursday",
    priority: "high"
  },
];

const PriorityBadge: React.FC<{ priority: "low" | "medium" | "high" }> = ({ priority }) => {
  const colorMap = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800"
  };
  
  return (
    <span className={`text-xs px-2 py-1 rounded-full ${colorMap[priority]}`}>
      {priority}
    </span>
  );
};

const UpcomingTasks: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold tracking-tight">Upcoming Tasks</h2>
        <button className="text-sm text-primary">View all</button>
      </div>
      
      <div className="bg-card rounded-lg border shadow-sm">
        <div className="divide-y">
          {mockTasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between p-3">
              <div className="flex items-center">
                <CalendarClock className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm font-medium">{task.title}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-muted-foreground">{task.due}</span>
                <PriorityBadge priority={task.priority} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UpcomingTasks;
