# 🔗 Frontend to Backend Integration Guide

## Overview

Connect your React frontend to the backend API to replace mock data with real MySQL data.

---

## 📋 Current Project Structure

```
IT-BUDGET-BUDDY/
├── frontend/
│   └── it-budget-buddy-63/
│       └── src/
│           ├── context/
│           │   └── AppContext.tsx    ← Replace mock data here
│           ├── pages/
│           │   ├── LoginPage.tsx
│           │   ├── DepartmentDashboard.tsx
│           │   └── AdminDashboard.tsx
│           └── data/
│               └── mockData.ts        ← Remove this eventually
│
└── backend/
    ├── app.py                ✅ Created with all endpoints
    └── requirements.txt      ✅ Created with dependencies
```

---

## 🚀 Step 1: Create API Service Module

Create a new file: [src/services/api.ts](src/services/api.ts)

```typescript
// src/services/api.ts

const API_BASE_URL = "http://localhost:5000";

export const apiService = {
  // ==================== AUTHENTICATION ====================
  login: async (username: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (data.status === "success") {
      return data.user;
    }
    throw new Error(data.message || "Login failed");
  },

  // ==================== DEPARTMENTS ====================
  getDepartments: async () => {
    const response = await fetch(`${API_BASE_URL}/departments`);
    const data = await response.json();
    if (data.status === "success") {
      return data.departments;
    }
    throw new Error("Failed to fetch departments");
  },

  createDepartment: async (dept: { id: string; name: string; budget: number }) => {
    const response = await fetch(`${API_BASE_URL}/departments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dept),
    });
    const data = await response.json();
    if (data.status === "success") {
      return data;
    }
    throw new Error(data.message || "Failed to create department");
  },

  // ==================== USERS ====================
  getUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/users`);
    const data = await response.json();
    if (data.status === "success") {
      return data.users;
    }
    throw new Error("Failed to fetch users");
  },

  createUser: async (user: any) => {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });
    const data = await response.json();
    if (data.status === "success") {
      return data;
    }
    throw new Error(data.message || "Failed to create user");
  },

  // ==================== EXPENSES ====================
  getExpenses: async (deptId?: string) => {
    const url = deptId
      ? `${API_BASE_URL}/expenses?dept_id=${deptId}`
      : `${API_BASE_URL}/expenses`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.status === "success") {
      return data.expenses;
    }
    throw new Error("Failed to fetch expenses");
  },

  getExpenseById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/expenses/${id}`);
    const data = await response.json();
    if (data.status === "success") {
      return data.expense;
    }
    throw new Error("Failed to fetch expense");
  },

  createExpense: async (expense: any) => {
    const response = await fetch(`${API_BASE_URL}/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(expense),
    });
    const data = await response.json();
    if (data.status === "success") {
      return data;
    }
    throw new Error(data.message || "Failed to create expense");
  },

  updateExpense: async (id: string, updates: any) => {
    const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const data = await response.json();
    if (data.status === "success") {
      return data;
    }
    throw new Error(data.message || "Failed to update expense");
  },

  // ==================== LICENSES ====================
  getLicenses: async (deptId?: string) => {
    const url = deptId
      ? `${API_BASE_URL}/licenses?dept_id=${deptId}`
      : `${API_BASE_URL}/licenses`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.status === "success") {
      return data.licenses;
    }
    throw new Error("Failed to fetch licenses");
  },

  createLicense: async (license: any) => {
    const response = await fetch(`${API_BASE_URL}/licenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(license),
    });
    const data = await response.json();
    if (data.status === "success") {
      return data;
    }
    throw new Error(data.message || "Failed to create license");
  },

  updateLicense: async (id: string, used: number) => {
    const response = await fetch(`${API_BASE_URL}/licenses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ used }),
    });
    const data = await response.json();
    if (data.status === "success") {
      return data;
    }
    throw new Error(data.message || "Failed to update license");
  },

  // ==================== DASHBOARDS ====================
  getDepartmentDashboard: async (deptId: string) => {
    const response = await fetch(`${API_BASE_URL}/dashboard/department/${deptId}`);
    const data = await response.json();
    if (data.status === "success") {
      return data;
    }
    throw new Error("Failed to fetch dashboard");
  },

  getAdminDashboard: async () => {
    const response = await fetch(`${API_BASE_URL}/dashboard/admin`);
    const data = await response.json();
    if (data.status === "success") {
      return data;
    }
    throw new Error("Failed to fetch admin dashboard");
  },
};
```

---

## 🔄 Step 2: Update AppContext.tsx

Replace mock data with API calls:

```typescript
// src/context/AppContext.tsx

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { apiService } from "@/services/api";

interface AppState {
  currentUser: any | null;
  users: any[];
  departments: any[];
  expenses: any[];
  licenses: any[];
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  addDepartment: (dept: Omit<any, "id">) => Promise<void>;
  addUser: (user: Omit<any, "id">) => Promise<void>;
  addExpense: (expense: Omit<any, "id">) => Promise<void>;
  updateLicense: (id: string, used: number) => Promise<void>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [licenses, setLicenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data on mount
  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [depts, users, exps, lics] = await Promise.all([
        apiService.getDepartments(),
        apiService.getUsers(),
        apiService.getExpenses(),
        apiService.getLicenses(),
      ]);
      setDepartments(depts);
      setUsers(users);
      setExpenses(exps);
      setLicenses(lics);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load data";
      setError(errorMessage);
      console.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const user = await apiService.login(username, password);
      setCurrentUser(user);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setError(null);
  };

  const addDepartment = async (dept: Omit<any, "id">) => {
    try {
      setError(null);
      const newDept = { id: `d${Date.now()}`, ...dept };
      await apiService.createDepartment(newDept);
      setDepartments((prev) => [...prev, newDept]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create department";
      setError(errorMessage);
      throw err;
    }
  };

  const addUser = async (user: Omit<any, "id">) => {
    try {
      setError(null);
      const newUser = { id: `u${Date.now()}`, ...user };
      await apiService.createUser(newUser);
      setUsers((prev) => [...prev, newUser]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create user";
      setError(errorMessage);
      throw err;
    }
  };

  const addExpense = async (expense: Omit<any, "id">) => {
    try {
      setError(null);
      const newExpense = { id: `e${Date.now()}`, ...expense };
      await apiService.createExpense(newExpense);
      setExpenses((prev) => [...prev, newExpense]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create expense";
      setError(errorMessage);
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
      const errorMessage = err instanceof Error ? err.message : "Failed to update license";
      setError(errorMessage);
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
        loading,
        error,
        login,
        logout,
        addDepartment,
        addUser,
        addExpense,
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
```

---

## 🖥️ Step 3: Update LoginPage.tsx

```typescript
// src/pages/LoginPage.tsx (update login handler)

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, loading } = useApp();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError("");
      await login(username, password);
      navigate("/dashboard"); // Adjust path based on your routing
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
        {error && <div className="error">{error}</div>}
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
```

---

## 📊 Step 4: Update DashboardPages

Example for AdminDashboard:

```typescript
// src/pages/AdminDashboard.tsx (replace mock data)

import { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { apiService } from "@/services/api";

export default function AdminDashboard() {
  const { departments, expenses, licenses, loading } = useApp();
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await apiService.getAdminDashboard();
        setDashboardData(data);
      } catch (err) {
        console.error("Failed to fetch dashboard:", err);
      }
    };
    fetchDashboard();
  }, []);

  if (loading || !dashboardData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      
      {/* Departments Section */}
      <div className="section">
        <h2>Departments</h2>
        <table>
          <thead>
            <tr>
              <th>Department</th>
              <th>Budget</th>
              <th>Spent</th>
              <th>Remaining</th>
            </tr>
          </thead>
          <tbody>
            {dashboardData.departments?.map((dept: any) => (
              <tr key={dept.id}>
                <td>{dept.name}</td>
                <td>${dept.budget}</td>
                <td>${dept.spent}</td>
                <td>${dept.budget - dept.spent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Spending by Category */}
      <div className="section">
        <h2>Spending by Category</h2>
        <ul>
          {dashboardData.spending_by_category?.map((item: any) => (
            <li key={item.category}>
              {item.category}: ${item.total}
            </li>
          ))}
        </ul>
      </div>

      {/* Top Licenses */}
      <div className="section">
        <h2>Top Licenses</h2>
        <ul>
          {dashboardData.top_licenses?.map((lic: any) => (
            <li key={lic.software}>
              {lic.software}: ${lic.total_cost}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

---

## 🌐 Step 5: Test Integration

### Before starting backend:
1. Ensure MySQL database is running
2. Ensure DATABASE_SETUP.sql has been executed
3. Terminal with backend: `cd backend && python app.py`

### Start React frontend:
```bash
cd frontend/it-budget-buddy-63
npm run dev
```

### Test flow:
1. Open http://localhost:5173 (or your React port)
2. Login with: admin / admin123
3. Check browser DevTools → Network tab to see API calls
4. Check browser Console for any errors

---

## ✅ Integration Checklist

- [ ] Create `src/services/api.ts` file
- [ ] Update `AppContext.tsx` with API calls
- [ ] Update `LoginPage.tsx` to use API login
- [ ] Update dashboard pages to fetch real data
- [ ] Backend running on port 5000
- [ ] MySQL database has data
- [ ] React frontend runs without errors
- [ ] Login creates database entry
- [ ] Creating new expense appears in MySQL
- [ ] Network tab shows API calls
- [ ] No CORS errors in console

---

## 🚀 Common Integration Issues

| Issue | Solution |
|-------|----------|
| CORS error | Backend already has CORS enabled (Flask-CORS) |
| 404 errors | Check API URL is `http://localhost:5000` |
| Login fails | Verify database has users table |
| No data loads | Run DATABASE_SETUP.sql first |
| Network shows 127.0.0.1:5000 | Normal - that's localhost |

---

## 📞 Next Steps

1. ✅ Create API service (api.ts)
2. ✅ Update AppContext
3. ✅ Update LoginPage
4. ✅ Update Dashboard components
5. ✅ Test with backend running
6. ✅ Verify data in MySQL
7. ✅ Handle loading/error states
8. ✅ Add form validations
9. ✅ Deploy to production

---

**Frontend-Backend integration complete! 🎉**
