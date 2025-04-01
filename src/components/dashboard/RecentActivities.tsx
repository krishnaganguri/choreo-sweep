
import React from "react";
import { 
  ClipboardCheck, 
  ShoppingCart, 
  CreditCard, 
  Bell 
} from "lucide-react";

type ActivityType = "chore" | "grocery" | "expense" | "reminder";

interface Activity {
  id: number;
  type: ActivityType;
  description: string;
  timestamp: string;
  user: string;
}

// Mock data - in a real app this would come from an API
const mockActivities: Activity[] = [
  {
    id: 1,
    type: "chore",
    description: "Took out the trash",
    timestamp: "10 minutes ago",
    user: "John"
  },
  {
    id: 2,
    type: "grocery",
    description: "Added milk to shopping list",
    timestamp: "1 hour ago",
    user: "Sarah"
  },
  {
    id: 3,
    type: "expense",
    description: "Paid electric bill: $85",
    timestamp: "3 hours ago",
    user: "John"
  },
  {
    id: 4,
    type: "reminder",
    description: "Set reminder: Pick up kids at 3pm",
    timestamp: "Yesterday",
    user: "Sarah"
  },
  {
    id: 5,
    type: "chore",
    description: "Cleaned kitchen",
    timestamp: "Yesterday",
    user: "John"
  }
];

const ActivityIcon: React.FC<{ type: ActivityType }> = ({ type }) => {
  switch (type) {
    case "chore":
      return <ClipboardCheck className="h-4 w-4 text-chores" />;
    case "grocery":
      return <ShoppingCart className="h-4 w-4 text-groceries" />;
    case "expense":
      return <CreditCard className="h-4 w-4 text-expenses" />;
    case "reminder":
      return <Bell className="h-4 w-4 text-reminders" />;
    default:
      return null;
  }
};

const RecentActivities: React.FC = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight">Recent Activities</h2>
      
      <div className="bg-card rounded-lg border shadow-sm">
        <div className="divide-y">
          {mockActivities.map((activity) => (
            <div key={activity.id} className="flex items-center p-3">
              <div className="mr-3">
                <ActivityIcon type={activity.type} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{activity.description}</p>
                <div className="flex text-xs text-muted-foreground gap-1">
                  <span>{activity.user}</span>
                  <span>•</span>
                  <span>{activity.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecentActivities;
