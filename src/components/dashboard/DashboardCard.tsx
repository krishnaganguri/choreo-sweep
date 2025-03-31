
import React from "react";
import { Link } from "react-router-dom";

interface DashboardCardProps {
  title: string;
  description: string;
  path: string;
  icon: React.ReactNode;
  color: string;
  count?: number;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  description,
  path,
  icon,
  color,
  count,
}) => {
  return (
    <Link to={path} className="block animate-slide-up">
      <div className={`card-container border-l-4 ${color}`}>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-lg">{title}</h3>
          <div className={`text-${color} p-2 rounded-full bg-opacity-10 bg-${color}`}>
            {icon}
          </div>
        </div>
        <p className="text-muted-foreground text-sm">{description}</p>
        {count !== undefined && (
          <div className="mt-3 flex justify-between items-center">
            <div className={`text-${color} font-semibold text-lg`}>{count} items</div>
            <span className="text-sm text-muted-foreground">View all →</span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default DashboardCard;
