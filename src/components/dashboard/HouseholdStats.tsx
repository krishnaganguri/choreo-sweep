
import React from "react";
import { Calendar, Users, Home, Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Mock data - in a real app this would come from an API
const mockHouseholdData = {
  familyMembers: 4,
  nextEvent: "Family Dinner",
  eventDate: "Today, 7:00 PM",
  tasksCompleted: 16,
  tasksRemaining: 7,
  homeAnniversary: "2 years, 3 months",
  todayTemperature: "72°F",
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, description }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="h-4 w-4 text-muted-foreground">{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
    </CardContent>
  </Card>
);

const HouseholdStats: React.FC = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight">Household Overview</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Family Members"
          value={mockHouseholdData.familyMembers}
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          title="Tasks Completed"
          value={mockHouseholdData.tasksCompleted}
          icon={<Clock className="h-4 w-4" />}
          description="This week"
        />
        <StatCard
          title="Tasks Remaining"
          value={mockHouseholdData.tasksRemaining}
          icon={<Clock className="h-4 w-4" />}
          description="To be done"
        />
        <StatCard
          title="Next Event"
          value={mockHouseholdData.nextEvent}
          icon={<Calendar className="h-4 w-4" />}
          description={mockHouseholdData.eventDate}
        />
      </div>
    </div>
  );
};

export default HouseholdStats;
