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