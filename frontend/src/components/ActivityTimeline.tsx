import { type Expense } from "@/data/mockData";
import CategoryBadge from "@/components/CategoryBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

interface Props {
  expenses: Expense[];
  departments?: { id: string; name: string }[];
  limit?: number;
}

export default function ActivityTimeline({ expenses, departments, limit = 8 }: Props) {
  const sorted = [...expenses].sort((a, b) => b.month.localeCompare(a.month)).slice(0, limit);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-0">
          {sorted.map((expense, i) => {
            const deptName = departments?.find((d) => d.id === expense.deptId)?.name;
            return (
              <div key={expense.id} className="flex gap-4 pb-4 last:pb-0 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                {/* Timeline line */}
                <div className="flex flex-col items-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-primary/20 shrink-0 mt-1.5" />
                  {i < sorted.length - 1 && <div className="w-0.5 flex-1 bg-border mt-1" />}
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0 pb-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="text-sm font-medium text-foreground truncate">{expense.description}</p>
                    <span className="text-sm font-bold text-foreground whitespace-nowrap">${expense.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <CategoryBadge category={expense.category} />
                    {deptName && <span className="text-xs text-muted-foreground">• {deptName}</span>}
                    <span className="text-xs text-muted-foreground">• {expense.month}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
