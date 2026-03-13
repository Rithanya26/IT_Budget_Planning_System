import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "@/context/AppContext";
import LoginPage from "@/pages/LoginPage";
import AdminDashboard from "@/pages/AdminDashboard";
import DepartmentManagement from "@/pages/DepartmentManagement";
import UserManagement from "@/pages/UserManagement";
import VendorsManagement from "@/pages/VendorsManagement";
import DepartmentDashboard from "@/pages/DepartmentDashboard";
import ForecastingPage from "@/pages/ForecastingPage";
import OptimizationPage from "@/pages/OptimizationPage";
import AppLayout from "@/components/AppLayout";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { currentUser } = useApp();

  if (!currentUser) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage />} />
      </Routes>
    );
  }

  if (currentUser.role === "admin") {
    return (
      <AppLayout>
        <Routes>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/departments" element={<DepartmentManagement />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/vendors" element={<VendorsManagement />} />
          <Route path="/admin/forecasting" element={<ForecastingPage />} />
          <Route path="/admin/optimization" element={<OptimizationPage />} />
          <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/department" element={<DepartmentDashboard />} />
        <Route path="/department/forecasting" element={<ForecastingPage />} />
        <Route path="/department/optimization" element={<OptimizationPage />} />
        <Route path="/" element={<Navigate to="/department" replace />} />
        <Route path="*" element={<Navigate to="/department" replace />} />
      </Routes>
    </AppLayout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
