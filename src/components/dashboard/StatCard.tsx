import { ArrowUp, ArrowDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  change: number;
  trend: "up" | "down";
}

const StatCard = ({ title, value, change, trend }: StatCardProps) => {
  const isPositive = trend === "up";
  
  return (
    <div className="glass rounded-2xl p-6 space-y-2">
      <h3 className="text-muted-foreground text-sm font-medium">{title}</h3>
      <div className="flex items-end justify-between">
        <p className="text-5xl font-bold text-foreground">{value}</p>
        <div className={`flex items-center gap-1 text-sm font-semibold ${
          isPositive ? "text-green-400" : "text-red-400"
        }`}>
          {isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
          {change}%
        </div>
      </div>
    </div>
  );
};

export default StatCard;
