import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

import { apiService, setAuthToken } from "@/services/api";
import type { User, Department, Expense, License, Category } from "@/data/mockData";

interface AppState {
  currentUser: User | null;
  users: User[];
  departments: Department[];
  expenses: Expense[];
  licenses: License[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  addDepartment: (dept: Omit<Department, "id">) => Promise<void>;
  updateDepartment: (id: string, updates: Partial<Department>) => void;
  addUser: (user: Omit<User, "id">) => Promise<void>;
  addExpense: (expense: Omit<Expense, "id">) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  updateLicense: (id: string, used: number) => Promise<void>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data from backend on first render
  useEffect(() => {
    void refreshData();
  }, []);

  const refreshData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [rawDepts, rawUsers, rawExps, rawLics, rawCats] = await Promise.all([
        apiService.getDepartments(),
        apiService.getUsers(),
        apiService.getExpenses(),
        apiService.getLicenses(),
        apiService.getCategories(),
      ]);

      // Map backend rows into the shapes the UI expects
      setDepartments(
        (rawDepts as any[]).map(
          (d): Department => ({
            id: d.id,
            name: d.name,
            budget: Number(d.budget),
          })
        )
      );

      setUsers(
        (rawUsers as any[]).map(
          (u): User => ({
            id: u.id,
            username: u.username,
            // Password is not returned from backend for security
            password: "",
            role: u.role,
            deptId: u.dept_id || undefined,
            displayName: u.display_name,
          })
        )
      );

      setExpenses(
        (rawExps as any[]).map(
          (e): Expense => ({
            id: e.id,
            deptId: e.dept_id,
            category: e.category,
            amount: Number(e.amount),
            month: e.month,
            description: e.description || "",
          })
        )
      );

      setLicenses(
        (rawLics as any[]).map(
          (l): License => ({
            id: l.id,
            deptId: l.dept_id,
            software: l.software,
            totalPurchased: l.total_purchased,
            used: l.used,
            costPerLicense: Number(l.cost_per_license),
          })
        )
      );

      setCategories(
        (rawCats as any[]).map(
          (c): Category => ({
            id: c.id,
            name: c.name,
            description: c.description || "",
            color_code: c.color_code || "#666666",
          })
        )
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load data from API";
      setError(message);
      console.error(message);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const { user: backendUser, token } = await apiService.login(username, password);

      const user: User = {
        id: backendUser.id,
        username: backendUser.username,
        password: "",
        role: backendUser.role,
        deptId: backendUser.dept_id || undefined,
        displayName: backendUser.display_name,
      };

      setCurrentUser(user);
      setAuthToken(token);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setError(null);
    setAuthToken(null);
  };

  const addDepartment = async (dept: Omit<Department, "id">) => {
    try {
      setError(null);
      const newDept: Department = { id: `d${Date.now()}`, ...dept };
      await apiService.createDepartment({
        id: newDept.id,
        name: newDept.name,
        budget: newDept.budget,
      } as any);
      setDepartments((prev) => [...prev, newDept]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create department";
      setError(message);
      throw err;
    }
  };

  const updateDepartment = (id: string, updates: Partial<Department>) => {
    // UI-only update; backend update can be added if required
    setDepartments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates } : d))
    );
  };

  const addUser = async (user: Omit<User, "id">) => {
    try {
      setError(null);
      const newUser: User = { id: `u${Date.now()}`, ...user };
      await apiService.createUser({
        id: newUser.id,
        username: newUser.username,
        password: newUser.password,
        display_name: newUser.displayName,
        role: newUser.role,
        dept_id: newUser.deptId,
      } as any);
      setUsers((prev) => [...prev, newUser]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create user";
      setError(message);
      throw err;
    }
  };

  const addExpense = async (expense: Omit<Expense, "id">) => {
    try {
      setError(null);
      const newExpense: Expense = { id: `e${Date.now()}`, ...expense };
      
      // Validate amount
      if (!newExpense.amount || newExpense.amount <= 0) {
        throw new Error("Amount must be greater than 0");
      }
      
      if (!newExpense.month) {
        throw new Error("Month is required");
      }

      await apiService.createExpense({
        id: newExpense.id,
        dept_id: newExpense.deptId,
        category: newExpense.category,
        amount: newExpense.amount,
        month: newExpense.month,
        description: newExpense.description,
      });
      
      setExpenses((prev) => [...prev, newExpense]);
      
      // Refresh data to ensure sync with backend
      await refreshData();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create expense";
      setError(message);
      throw err;
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      setError(null);
      await apiService.deleteExpense(id);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      // Refresh data to ensure sync with backend
      await refreshData();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete expense";
      setError(message);
      throw err;
    }
  };

  const updateLicense = async (id: string, used: number) => {
    try {
      setError(null);
      await apiService.updateLicense(id, used);
      setLicenses((prev) =>
        prev.map((l) => (l.id === id ? { ...l, used } : l))
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update license";
      setError(message);
      throw err;
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        departments,
        expenses,
        licenses,
        categories,
        loading,
        error,
        login,
        logout,
        addDepartment,
        updateDepartment,
        addUser,
        addExpense,
        deleteExpense,
        updateLicense,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}


