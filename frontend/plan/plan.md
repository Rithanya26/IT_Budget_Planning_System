

# IT Budget Planner — Implementation Plan

## Overview
A complete frontend React application for IT budget planning with mock data, role-based dashboards, charts, forecasting, and cost optimization — all in a lavender color theme.

---

## 1. Lavender Theme & Design System
- Custom lavender/purple color palette applied across the entire app
- Clean, modern UI using Tailwind CSS with consistent styling
- Responsive layout that works on desktop and tablet

## 2. Authentication (Mock)
- Login page with username/password fields
- Two demo accounts: **Admin** and **Department User** (pre-filled for easy testing)
- Role-based routing — Admin goes to Admin Dashboard, Department User goes to Department Dashboard
- Logout functionality

## 3. Admin Dashboard
- **Overview cards**: Total budget, total spent, remaining, number of departments
- **Department management**: View/create/edit departments (HR, Cloud, Dev, Finance, etc.)
- **User management**: Create department users and assign them to departments
- **Budget allocation**: Set monthly/yearly budgets per department
- **Alerts panel**: Warnings for departments at 80%+ usage, over-budget alerts
- **Charts**:
  - Bar chart: Budget vs actual spending per department
  - Pie chart: Cost distribution across departments

## 4. Department User Dashboard
- Auto-loads the user's assigned department data
- **Overview cards**: Department budget, total spent, remaining, usage percentage
- **Add expenses**: Form to log expenses by category (Cloud, Software Licenses, Hardware, Maintenance)
- **Expense history**: Table of past expenses with category, amount, and month
- **Alerts**: Warning at 80%, over-budget at 100%
- **Charts**:
  - Line chart: Monthly expense trend
  - Progress bar: Budget usage percentage

## 5. Forecasting Module
- Based on last 3 months of mock expense data
- Predicted next month expense (simple average)
- Yearly expense estimation
- Displayed as text summary + line chart with forecast overlay

## 6. Cost Optimization Suggestions
- Flag departments with consistently high cloud costs (potential under-utilization)
- Software license tracker: Total purchased vs used/unused
- Suggestions panel recommending reductions for unused licenses

## 7. Mock Data
- Pre-populated departments, users, expenses, and license data
- Realistic sample data spanning 6+ months for meaningful charts and forecasts

## 8. Navigation
- Sidebar navigation with role-appropriate menu items
- Clean page transitions between dashboard sections

