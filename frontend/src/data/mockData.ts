// ===== TYPES =====

export interface User {
  id: string;
  username: string;
  password: string;
  role: "admin" | "department";
  deptId?: string;
  displayName: string;
}

export interface Department {
  id: string;
  name: string;
  budget: number;
}

export interface Expense {
  id: string;
  deptId: string;
  category: "Cloud" | "Software Licenses" | "Hardware" | "Maintenance";
  amount: number;
  month: string; // e.g. "2025-07"
  description: string;
}

export interface License {
  id: string;
  deptId: string;
  software: string;
  totalPurchased: number;
  used: number;
  costPerLicense: number;
}

// ===== MOCK DATA =====

export const initialDepartments: Department[] = [
  { id: "d1", name: "HR", budget: 50000 },
  { id: "d2", name: "Cloud Infrastructure", budget: 120000 },
  { id: "d3", name: "Software Development", budget: 90000 },
  { id: "d4", name: "Finance", budget: 40000 },
  { id: "d5", name: "Seurity", budget: 70000 },
];

export const initialUsers: User[] = [
  { id: "u1", username: "admin", password: "admin123", role: "admin", displayName: "IT Manager" },
  { id: "u2", username: "hr_user", password: "pass123", role: "department", deptId: "d1", displayName: "HR Lead" },
  { id: "u3", username: "cloud_user", password: "pass123", role: "department", deptId: "d2", displayName: "Cloud Engineer" },
  { id: "u4", username: "dev_user", password: "pass123", role: "department", deptId: "d3", displayName: "Dev Lead" },
  { id: "u5", username: "finance_user", password: "pass123", role: "department", deptId: "d4", displayName: "Finance Analyst" },
  { id: "u6", username: "security_user", password: "pass123", role: "department", deptId: "d5", displayName: "Security Lead" },
];

export const initialExpenses: Expense[] = [
  // HR
  { id: "e1", deptId: "d1", category: "Software Licenses", amount: 3200, month: "2025-04", description: "HR Management Suite" },
  { id: "e2", deptId: "d1", category: "Hardware", amount: 5500, month: "2025-05", description: "Laptops for new hires" },
  { id: "e3", deptId: "d1", category: "Software Licenses", amount: 3200, month: "2025-06", description: "HR Management Suite renewal" },
  { id: "e4", deptId: "d1", category: "Maintenance", amount: 1800, month: "2025-07", description: "System maintenance" },
  { id: "e5", deptId: "d1", category: "Software Licenses", amount: 3200, month: "2025-08", description: "HR Suite Q3" },
  { id: "e6", deptId: "d1", category: "Hardware", amount: 2400, month: "2025-09", description: "Monitors" },
  // Cloud Infrastructure
  { id: "e7", deptId: "d2", category: "Cloud", amount: 18000, month: "2025-04", description: "AWS monthly" },
  { id: "e8", deptId: "d2", category: "Cloud", amount: 19500, month: "2025-05", description: "AWS monthly + scaling" },
  { id: "e9", deptId: "d2", category: "Cloud", amount: 21000, month: "2025-06", description: "AWS monthly + new services" },
  { id: "e10", deptId: "d2", category: "Cloud", amount: 20000, month: "2025-07", description: "AWS monthly" },
  { id: "e11", deptId: "d2", category: "Maintenance", amount: 3500, month: "2025-08", description: "Infrastructure maintenance" },
  { id: "e12", deptId: "d2", category: "Cloud", amount: 22000, month: "2025-09", description: "AWS + Azure expansion" },
  // Software Development
  { id: "e13", deptId: "d3", category: "Software Licenses", amount: 5000, month: "2025-04", description: "JetBrains licenses" },
  { id: "e14", deptId: "d3", category: "Cloud", amount: 8000, month: "2025-05", description: "Dev environment hosting" },
  { id: "e15", deptId: "d3", category: "Hardware", amount: 12000, month: "2025-06", description: "Developer workstations" },
  { id: "e16", deptId: "d3", category: "Software Licenses", amount: 5000, month: "2025-07", description: "JetBrains renewal" },
  { id: "e17", deptId: "d3", category: "Cloud", amount: 8500, month: "2025-08", description: "Staging servers" },
  { id: "e18", deptId: "d3", category: "Maintenance", amount: 3000, month: "2025-09", description: "CI/CD maintenance" },
  // Finance
  { id: "e19", deptId: "d4", category: "Software Licenses", amount: 4500, month: "2025-04", description: "SAP license" },
  { id: "e20", deptId: "d4", category: "Software Licenses", amount: 4500, month: "2025-06", description: "SAP renewal" },
  { id: "e21", deptId: "d4", category: "Hardware", amount: 3000, month: "2025-07", description: "Secure workstations" },
  { id: "e22", deptId: "d4", category: "Maintenance", amount: 1500, month: "2025-08", description: "Audit system maintenance" },
  { id: "e23", deptId: "d4", category: "Software Licenses", amount: 4500, month: "2025-09", description: "SAP Q3" },
  // Security
  { id: "e24", deptId: "d5", category: "Software Licenses", amount: 8000, month: "2025-04", description: "CrowdStrike licenses" },
  { id: "e25", deptId: "d5", category: "Cloud", amount: 5000, month: "2025-05", description: "SIEM cloud hosting" },
  { id: "e26", deptId: "d5", category: "Hardware", amount: 6000, month: "2025-06", description: "Firewall appliances" },
  { id: "e27", deptId: "d5", category: "Software Licenses", amount: 8000, month: "2025-07", description: "CrowdStrike renewal" },
  { id: "e28", deptId: "d5", category: "Cloud", amount: 5500, month: "2025-08", description: "SIEM scaling" },
  { id: "e29", deptId: "d5", category: "Maintenance", amount: 4000, month: "2025-09", description: "Security audit tools" },
];

export const initialLicenses: License[] = [
  { id: "l1", deptId: "d1", software: "HR Management Suite", totalPurchased: 50, used: 35, costPerLicense: 64 },
  { id: "l2", deptId: "d2", software: "Datadog Monitoring", totalPurchased: 20, used: 12, costPerLicense: 150 },
  { id: "l3", deptId: "d3", software: "JetBrains All Products", totalPurchased: 30, used: 22, costPerLicense: 167 },
  { id: "l4", deptId: "d3", software: "GitHub Enterprise", totalPurchased: 40, used: 38, costPerLicense: 21 },
  { id: "l5", deptId: "d4", software: "SAP ERP", totalPurchased: 15, used: 8, costPerLicense: 300 },
  { id: "l6", deptId: "d5", software: "CrowdStrike Falcon", totalPurchased: 100, used: 72, costPerLicense: 80 },
  { id: "l7", deptId: "d5", software: "Splunk Enterprise", totalPurchased: 10, used: 4, costPerLicense: 500 },
];

// ===== HELPER FUNCTIONS =====

export function getDeptExpenses(expenses: Expense[], deptId: string) {
  return expenses.filter((e) => e.deptId === deptId);
}

export function getDeptTotalSpent(expenses: Expense[], deptId: string) {
  return getDeptExpenses(expenses, deptId).reduce((sum, e) => sum + e.amount, 0);
}

export function getMonthlyBreakdown(expenses: Expense[], deptId: string) {
  const deptExpenses = getDeptExpenses(expenses, deptId);
  const byMonth: Record<string, number> = {};
  deptExpenses.forEach((e) => {
    byMonth[e.month] = (byMonth[e.month] || 0) + e.amount;
  });
  return Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, total]) => ({ month, total }));
}

export function getForecast(expenses: Expense[], deptId: string) {
  const monthly = getMonthlyBreakdown(expenses, deptId);
  const last3 = monthly.slice(-3);
  if (last3.length === 0) return { nextMonth: 0, yearly: 0 };
  const avg = last3.reduce((s, m) => s + m.total, 0) / last3.length;
  return { nextMonth: Math.round(avg), yearly: Math.round(avg * 12) };
}

export function getCategoryBreakdown(expenses: Expense[], deptId?: string) {
  const filtered = deptId ? getDeptExpenses(expenses, deptId) : expenses;
  const byCat: Record<string, number> = {};
  filtered.forEach((e) => {
    byCat[e.category] = (byCat[e.category] || 0) + e.amount;
  });
  return Object.entries(byCat).map(([category, total]) => ({ category, total }));
}
