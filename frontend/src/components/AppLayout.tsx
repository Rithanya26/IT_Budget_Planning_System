import { NavLink as RouterNavLink, useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import {
  LayoutDashboard, Building2, Users, TrendingUp, Lightbulb, LogOut, Menu, X, Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";

interface NavItem {
  label: string;
  to: string;
  icon: React.ElementType;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, logout } = useApp();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdmin = currentUser?.role === "admin";

  const adminNav: NavItem[] = [
    { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
    { label: "Departments", to: "/admin/departments", icon: Building2 },
    { label: "Users", to: "/admin/users", icon: Users },
    { label: "Vendors", to: "/admin/vendors", icon: Truck },
    { label: "Forecasting", to: "/admin/forecasting", icon: TrendingUp },
    { label: "Optimization", to: "/admin/optimization", icon: Lightbulb },
  ];

  const deptNav: NavItem[] = [
    { label: "Dashboard", to: "/department", icon: LayoutDashboard },
    { label: "Forecasting", to: "/department/forecasting", icon: TrendingUp },
    { label: "Optimization", to: "/department/optimization", icon: Lightbulb },
  ];

  const navItems = isAdmin ? adminNav : deptNav;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-foreground/20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-sidebar text-sidebar-foreground transition-transform lg:static lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-14 items-center justify-between border-b px-4">
          <span className="text-lg font-bold bg-gradient-to-r from-[hsl(262,60%,55%)] to-[hsl(290,60%,60%)] bg-clip-text text-transparent">IT Budget Planner</span>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => (
            <RouterNavLink
              key={item.to}
              to={item.to}
              end={item.to === "/admin" || item.to === "/department"}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-primary/15 to-primary/5 text-primary shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:translate-x-0.5"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </RouterNavLink>
          ))}
        </nav>

        <div className="border-t p-3 space-y-2">
          <div className="flex items-center justify-between px-3 py-2">
            <div>
              <p className="text-sm font-medium">{currentUser?.displayName}</p>
              <p className="text-xs text-muted-foreground capitalize">{currentUser?.role}</p>
            </div>
            <ThemeToggle />
          </div>
          <Button variant="ghost" className="w-full justify-start gap-2 text-sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center border-b px-4 lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <span className="ml-3 text-lg font-bold bg-gradient-to-r from-[hsl(262,60%,55%)] to-[hsl(290,60%,60%)] bg-clip-text text-transparent">IT Budget Planner</span>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
