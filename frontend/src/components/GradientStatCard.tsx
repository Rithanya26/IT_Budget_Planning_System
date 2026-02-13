import { Card, CardContent } from "@/components/ui/card";

const GRADIENT_PRESETS = [
  "from-[hsl(262,60%,55%)] to-[hsl(290,60%,60%)]",
  "from-[hsl(173,58%,45%)] to-[hsl(160,50%,50%)]",
  "from-[hsl(338,65%,55%)] to-[hsl(350,60%,60%)]",
  "from-[hsl(43,96%,56%)] to-[hsl(30,90%,55%)]",
  "from-[hsl(210,70%,55%)] to-[hsl(230,60%,60%)]",
  "from-[hsl(142,71%,45%)] to-[hsl(160,60%,50%)]",
];

interface GradientStatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  subtitle?: string;
  colorIndex?: number;
  delay?: number;
}

export default function GradientStatCard({
  icon: Icon,
  label,
  value,
  subtitle,
  colorIndex = 0,
  delay = 0,
}: GradientStatCardProps) {
  const gradient = GRADIENT_PRESETS[colorIndex % GRADIENT_PRESETS.length];

  return (
    <Card
      className="overflow-hidden animate-fade-up border-0 shadow-md hover:shadow-lg transition-shadow duration-300"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="p-0">
        <div className="flex items-center gap-4 p-5">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}
          >
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground truncate">{label}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
