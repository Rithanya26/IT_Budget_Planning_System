const API_BASE_URL = "http://localhost:5000";

const getToken = (): string | null => {
  return localStorage.getItem("it_budget_token");
};

const authHeaders = (): HeadersInit => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const setAuthToken = (token: string | null) => {
  if (token) localStorage.setItem("it_budget_token", token);
  else localStorage.removeItem("it_budget_token");
};

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
      return { user: data.user, token: data.token };
    }
    throw new Error(data.message || "Login failed");
  },

  // ==================== DEPARTMENTS ====================
  getDepartments: async () => {
    const response = await fetch(`${API_BASE_URL}/departments`, { headers: authHeaders() });
    const data = await response.json();
    if (data.status === "success") return data.departments;
    throw new Error("Failed to fetch departments");
  },

  createDepartment: async (dept: { id?: string; name: string; budget: number }) => {
    const response = await fetch(`${API_BASE_URL}/departments`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ id: dept.id, name: dept.name, budget: dept.budget }),
    });
    const data = await response.json();
    if (data.status === "success") return data;
    throw new Error(data.message || "Failed to create department");
  },

  // ==================== USERS ====================
  getUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/users`, { headers: authHeaders() });
    const data = await response.json();
    if (data.status === "success") return data.users;
    throw new Error("Failed to fetch users");
  },

  createUser: async (user: Record<string, unknown>) => {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(user),
    });
    const data = await response.json();
    if (data.status === "success") return data;
    throw new Error(data.message || "Failed to create user");
  },

  // ==================== BUDGETS ====================
  getBudgets: async (departmentId?: string, year?: number) => {
    const params = new URLSearchParams();
    if (departmentId) params.set("department_id", departmentId);
    if (year) params.set("year", String(year));
    const url = `${API_BASE_URL}/budgets${params.toString() ? `?${params}` : ""}`;
    const response = await fetch(url, { headers: authHeaders() });
    const data = await response.json();
    if (data.status === "success") return data.budgets;
    throw new Error("Failed to fetch budgets");
  },

  saveBudget: async (payload: { department_id: string; year?: number; allocated_amount: number }) => {
    const response = await fetch(`${API_BASE_URL}/budgets`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (data.status === "success") return data;
    throw new Error(data.message || "Failed to save budget");
  },

  // ==================== VENDORS ====================
  getVendors: async () => {
    const response = await fetch(`${API_BASE_URL}/vendors`, { headers: authHeaders() });
    const data = await response.json();
    if (data.status === "success") return data.vendors;
    throw new Error("Failed to fetch vendors");
  },

  createVendor: async (vendor: { name: string; contact_email?: string; annual_contract_value?: number; contract_start_date?: string; contract_end_date?: string }) => {
    const response = await fetch(`${API_BASE_URL}/vendors`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(vendor),
    });
    const data = await response.json();
    if (data.status === "success") return data;
    throw new Error(data.message || "Failed to create vendor");
  },

  updateVendor: async (id: number, updates: Record<string, unknown>) => {
    const response = await fetch(`${API_BASE_URL}/vendors/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(updates),
    });
    const data = await response.json();
    if (data.status === "success") return data;
    throw new Error(data.message || "Failed to update vendor");
  },

  deleteVendor: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/vendors/${id}`, { method: "DELETE", headers: authHeaders() });
    const data = await response.json();
    if (data.status === "success") return data;
    throw new Error(data.message || "Failed to delete vendor");
  },

  // ==================== EXPENSES ====================
  getExpenses: async (deptId?: string) => {
    const url = deptId ? `${API_BASE_URL}/expenses?dept_id=${deptId}` : `${API_BASE_URL}/expenses`;
    const response = await fetch(url, { headers: authHeaders() });
    const data = await response.json();
    if (data.status === "success") return data.expenses;
    throw new Error("Failed to fetch expenses");
  },

  getExpenseById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/expenses/${id}`, { headers: authHeaders() });
    const data = await response.json();
    if (data.status === "success") return data.expense;
    throw new Error("Failed to fetch expense");
  },

  createExpense: async (expense: Record<string, unknown>) => {
    console.log("Creating expense:", expense);
    const response = await fetch(`${API_BASE_URL}/expenses`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(expense),
    });
    const data = await response.json();
    console.log("Create expense response:", data);
    if (data.status === "success") return data;
    throw new Error(data.message || "Failed to create expense");
  },

  updateExpense: async (id: string, updates: Record<string, unknown>) => {
    const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(updates),
    });
    const data = await response.json();
    if (data.status === "success") return data;
    throw new Error(data.message || "Failed to update expense");
  },

  deleteExpense: async (id: string) => {
    console.log("Deleting expense:", id);
    const response = await fetch(`${API_BASE_URL}/expenses/${id}`, { method: "DELETE", headers: authHeaders() });
    const data = await response.json();
    console.log("Delete expense response:", data);
    if (data.status === "success") return data;
    throw new Error(data.message || "Failed to delete expense");
  },

  // ==================== CATEGORIES ====================
  getCategories: async () => {
    const response = await fetch(`${API_BASE_URL}/categories`, { headers: authHeaders() });
    const data = await response.json();
    if (data.status === "success") return data.categories;
    throw new Error("Failed to fetch categories");
  },

  // ==================== LICENSES (legacy) ====================
  getLicenses: async (deptId?: string) => {
    const url = deptId ? `${API_BASE_URL}/licenses?dept_id=${deptId}` : `${API_BASE_URL}/licenses`;
    const response = await fetch(url, { headers: authHeaders() });
    const data = await response.json();
    if (data.status === "success") return data.licenses;
    throw new Error("Failed to fetch licenses");
  },

  createLicense: async (license: Record<string, unknown>) => {
    const response = await fetch(`${API_BASE_URL}/licenses`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(license),
    });
    const data = await response.json();
    if (data.status === "success") return data;
    throw new Error(data.message || "Failed to create license");
  },

  updateLicense: async (id: string, used: number) => {
    const response = await fetch(`${API_BASE_URL}/licenses/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ used }),
    });
    const data = await response.json();
    if (data.status === "success") return data;
    throw new Error(data.message || "Failed to update license");
  },

  // ==================== SOFTWARE LICENSES (expiry tracking) ====================
  getSoftwareLicenses: async (departmentId?: string) => {
    const url = departmentId ? `${API_BASE_URL}/software-licenses?department_id=${departmentId}` : `${API_BASE_URL}/software-licenses`;
    const response = await fetch(url, { headers: authHeaders() });
    const data = await response.json();
    if (data.status === "success") return data.software_licenses;
    return [];
  },

  createSoftwareLicense: async (payload: { department_id: string; vendor_id?: number; software_name: string; purchase_date?: string; expiry_date?: string; renewal_cost?: number }) => {
    const response = await fetch(`${API_BASE_URL}/software-licenses`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (data.status === "success") return data;
    throw new Error(data.message || "Failed to create software license");
  },

  updateSoftwareLicense: async (id: number, updates: Record<string, unknown>) => {
    const response = await fetch(`${API_BASE_URL}/software-licenses/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(updates),
    });
    const data = await response.json();
    if (data.status === "success") return data;
    throw new Error(data.message || "Failed to update software license");
  },

  // ==================== FORECASTS ====================
  getForecasts: async (departmentId?: string, forecastType?: string) => {
    const params = new URLSearchParams();
    if (departmentId) params.set("department_id", departmentId);
    if (forecastType) params.set("forecast_type", forecastType);
    const url = `${API_BASE_URL}/forecasts${params.toString() ? `?${params}` : ""}`;
    const response = await fetch(url, { headers: authHeaders() });
    const data = await response.json();
    if (data.status === "success") return data.forecasts;
    return [];
  },

  generateForecasts: async (departmentId?: string) => {
    const response = await fetch(`${API_BASE_URL}/forecasts/generate`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(departmentId ? { department_id: departmentId } : {}),
    });
    const data = await response.json();
    if (data.status === "success") return data.forecasts;
    throw new Error(data.message || "Failed to generate forecasts");
  },

  // ==================== OPTIMIZATION ====================
  getOptimizationSuggestions: async (departmentId?: string) => {
    const url = departmentId ? `${API_BASE_URL}/optimization?department_id=${departmentId}` : `${API_BASE_URL}/optimization`;
    const response = await fetch(url, { headers: authHeaders() });
    const data = await response.json();
    if (data.status === "success") return data.suggestions;
    return [];
  },

  generateOptimization: async () => {
    const response = await fetch(`${API_BASE_URL}/optimization/generate`, { method: "POST", headers: authHeaders() });
    const data = await response.json();
    if (data.status === "success") return data;
    throw new Error(data.message || "Failed to generate optimization");
  },

  // ==================== ALERTS ====================
  getLicenseExpiryAlerts: async () => {
    const response = await fetch(`${API_BASE_URL}/alerts/licenses-expiring`, { headers: authHeaders() });
    const data = await response.json();
    if (data.status === "success") return data.alerts;
    return [];
  },

  getVendorExpiryAlerts: async () => {
    const response = await fetch(`${API_BASE_URL}/alerts/vendors-expiring`, { headers: authHeaders() });
    const data = await response.json();
    if (data.status === "success") return data.alerts;
    return [];
  },

  // ==================== DASHBOARDS ====================
  getDepartmentDashboard: async (deptId: string) => {
    const response = await fetch(`${API_BASE_URL}/dashboard/department/${deptId}`, { headers: authHeaders() });
    const data = await response.json();
    if (data.status === "success") return data;
    throw new Error("Failed to fetch dashboard");
  },

  getAdminDashboard: async () => {
    const response = await fetch(`${API_BASE_URL}/dashboard/admin`, { headers: authHeaders() });
    const data = await response.json();
    if (data.status === "success") return data;
    throw new Error("Failed to fetch admin dashboard");
  },
};
