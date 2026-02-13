import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LogIn, Shield, Building2 } from "lucide-react";

export default function LoginPage() {
  const { login, loading, error: ctxError } = useApp();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(username, password);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Invalid username or password";
      setError(msg);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-accent/30 to-background p-4">
      <div className="w-full max-w-md space-y-6 animate-fade-up">
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(262,60%,55%)] to-[hsl(290,60%,60%)] shadow-xl shadow-primary/25">
            <LogIn className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[hsl(262,60%,55%)] to-[hsl(290,60%,60%)] bg-clip-text text-transparent">IT Budget Planner</h1>
          <p className="text-muted-foreground">Sign in to manage your IT budgets</p>
        </div>

        <Card className="shadow-xl border-0 bg-card/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg">Login</CardTitle>
            <CardDescription>Enter your credentials to access the dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                />
              </div>
              {(error || ctxError) && (
                <p className="text-sm text-destructive">
                  {error || ctxError}
                </p>
              )}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[hsl(262,60%,55%)] to-[hsl(290,60%,60%)] hover:opacity-90 border-0 text-white shadow-lg shadow-primary/25"
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 rounded-xl border bg-muted/30 p-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Demo Accounts</p>
              <div className="space-y-2">
                <button
                  className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-accent/60 transition-all duration-200 flex items-center gap-3 group"
                  onClick={() => {
                    setUsername("admin");
                    setPassword("admin123");
                  }}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[hsl(262,60%,55%)] to-[hsl(290,60%,60%)]">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <span className="font-medium text-foreground text-sm">Admin</span>
                    <span className="text-muted-foreground text-xs block">admin / admin123</span>
                  </div>
                </button>
                <button
                  className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-accent/60 transition-all duration-200 flex items-center gap-3 group"
                  onClick={() => {
                    setUsername("cloud_user");
                    setPassword("pass123");
                  }}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[hsl(173,58%,45%)] to-[hsl(160,50%,50%)]">
                    <Building2 className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <span className="font-medium text-foreground text-sm">Cloud Dept</span>
                    <span className="text-muted-foreground text-xs block">cloud_user / pass123</span>
                  </div>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
