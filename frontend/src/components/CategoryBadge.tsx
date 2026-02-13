import { Cloud, Monitor, Cpu, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORY_STYLES: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  Cloud: { bg: "bg-[hsl(210,70%,55%)]/15", text: "text-[hsl(210,70%,55%)]", icon: Cloud },
  "Software Licenses": { bg: "bg-[hsl(262,60%,55%)]/15", text: "text-[hsl(262,60%,55%)]", icon: Monitor },
  Hardware: { bg: "bg-[hsl(338,65%,55%)]/15", text: "text-[hsl(338,65%,55%)]", icon: Cpu },
  Maintenance: { bg: "bg-[hsl(43,96%,56%)]/15", text: "text-[hsl(43,96%,56%)]", icon: Wrench },
};

export default function CategoryBadge({ category }: { category: string }) {
  const style = CATEGORY_STYLES[category] || { bg: "bg-muted", text: "text-muted-foreground", icon: Monitor };
  const Icon = style.icon;

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", style.bg, style.text)}>
      <Icon className="h-3 w-3" />
      {category}
    </span>
  );
}
