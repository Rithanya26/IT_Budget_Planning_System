# 🧪 Backend API Testing Guide

## Quick Start - Test Backend in 5 Minutes

### Prerequisites
- Backend running: `python app.py` (Flask server on port 5000)
- MySQL database running with data loaded

---

## 🔧 Method 1: Using PowerShell (Windows)

### Test 1: Health Check
```powershell
$uri = "http://localhost:5000/"
(Invoke-WebRequest -Uri $uri).Content | ConvertFrom-Json | Format-Table
```

### Test 2: Database Connection
```powershell
$uri = "http://localhost:5000/test-connection"
(Invoke-WebRequest -Uri $uri).Content | ConvertFrom-Json
```
**Expected:** `{ "status": "success", "message": "Connected to MySQL..." }`

### Test 3: Login - Admin
```powershell
$uri = "http://localhost:5000/login"
$body = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

(Invoke-WebRequest -Uri $uri -Method POST -Body $body -ContentType "application/json").Content | ConvertFrom-Json
```
**Expected:** Returns admin user object with id, username, display_name, role

### Test 4: Login - HR User
```powershell
$uri = "http://localhost:5000/login"
$body = @{
    username = "hr_user"
    password = "pass123"
} | ConvertTo-Json

(Invoke-WebRequest -Uri $uri -Method POST -Body $body -ContentType "application/json").Content | ConvertFrom-Json
```

### Test 5: Get All Departments
```powershell
$uri = "http://localhost:5000/departments"
(Invoke-WebRequest -Uri $uri).Content | ConvertFrom-Json | Format-Table -Width 100
```
**Expected:** Shows 5 departments (HR, Cloud Infrastructure, Software Development, Finance, Security)

### Test 6: Get All Users
```powershell
$uri = "http://localhost:5000/users"
(Invoke-WebRequest -Uri $uri).Content | ConvertFrom-Json | Format-Table -Width 100
```
**Expected:** Shows 6 users with display names

### Test 7: Get All Expenses
```powershell
$uri = "http://localhost:5000/expenses"
(Invoke-WebRequest -Uri $uri).Content | ConvertFrom-Json | Format-Table -Width 150
```
**Expected:** Shows 29 expenses with category, amount, month

### Test 8: Get Expenses by Department (d1 = HR)
```powershell
$uri = "http://localhost:5000/expenses?dept_id=d1"
(Invoke-WebRequest -Uri $uri).Content | ConvertFrom-Json | Format-Table -Width 150
```
**Expected:** Shows only HR department expenses

### Test 9: Get All Licenses
```powershell
$uri = "http://localhost:5000/licenses"
(Invoke-WebRequest -Uri $uri).Content | ConvertFrom-Json | Format-Table -Width 150
```
**Expected:** Shows 7 licenses (JetBrains, CrowdStrike, SAP, etc.)

### Test 10: Get Licenses by Department (d3 = Software Dev)
```powershell
$uri = "http://localhost:5000/licenses?dept_id=d3"
(Invoke-WebRequest -Uri $uri).Content | ConvertFrom-Json | Format-Table -Width 150
```
**Expected:** Shows Software Development licenses (JetBrains, GitHub Enterprise)

### Test 11: Create New Expense
```powershell
$uri = "http://localhost:5000/expenses"
$body = @{
    id = "e999"
    dept_id = "d2"
    category = "Cloud"
    amount = 25550
    month = "2025-10"
    description = "AWS + Azure expansion October"
} | ConvertTo-Json

(Invoke-WebRequest -Uri $uri -Method POST -Body $body -ContentType "application/json").Content | ConvertFrom-Json
```
**Expected:** `{ "status": "success", "message": "Expense created", "id": "e999" }`

### Test 12: Verify New Expense in Database
```powershell
$uri = "http://localhost:5000/expenses?dept_id=d2"
(Invoke-WebRequest -Uri $uri).Content | ConvertFrom-Json | ConvertTo-Json
```
**Check output:** Should include your new e999 expense

### Test 13: Update Expense
```powershell
$uri = "http://localhost:5000/expenses/e999"
$body = @{
    amount = 26000
    description = "AWS + Azure + new regions"
} | ConvertTo-Json

(Invoke-WebRequest -Uri $uri -Method PUT -Body $body -ContentType "application/json").Content | ConvertFrom-Json
```
**Expected:** `{ "status": "success", "message": "Expense updated" }`

### Test 14: Update License Usage
```powershell
$uri = "http://localhost:5000/licenses/l1"
$body = @{
    used = 40
} | ConvertTo-Json

(Invoke-WebRequest -Uri $uri -Method PUT -Body $body -ContentType "application/json").Content | ConvertFrom-Json
```
**Expected:** `{ "status": "success", "message": "License updated" }`

### Test 15: Create New User
```powershell
$uri = "http://localhost:5000/users"
$body = @{
    id = "u99"
    username = "testuser"
    password = "testpass123"
    display_name = "Test User"
    role = "department"
    dept_id = "d1"
} | ConvertTo-Json

(Invoke-WebRequest -Uri $uri -Method POST -Body $body -ContentType "application/json").Content | ConvertFrom-Json
```
**Expected:** `{ "status": "success", "message": "User created", "id": "u99" }`

### Test 16: Create New Department
```powershell
$uri = "http://localhost:5000/departments"
$body = @{
    id = "d99"
    name = "Test Department"
    budget = 100000
} | ConvertTo-Json

(Invoke-WebRequest -Uri $uri -Method POST -Body $body -ContentType "application/json").Content | ConvertFrom-Json
```
**Expected:** `{ "status": "success", "message": "Department created", "id": "d99" }`

### Test 17: Department Dashboard
```powershell
$uri = "http://localhost:5000/dashboard/department/d1"
(Invoke-WebRequest -Uri $uri).Content | ConvertFrom-Json | Format-Table -Width 150
```
**Expected:** Shows department info, expenses by category, monthly total, licenses

### Test 18: Admin Dashboard
```powershell
$uri = "http://localhost:5000/dashboard/admin"
(Invoke-WebRequest -Uri $uri).Content | ConvertFrom-Json | Format-Table -Width 150
```
**Expected:** Shows all departments, spending by category, top licenses

---

## 🌐 Method 2: Using cURL (Command Prompt or PowerShell)

### Health Check
```bash
curl http://localhost:5000/
```

### Login
```bash
curl -X POST http://localhost:5000/login ^
  -H "Content-Type: application/json" ^
  -d "{ \"username\": \"admin\", \"password\": \"admin123\" }"
```

### Get Departments
```bash
curl http://localhost:5000/departments
```

### Get Expenses
```bash
curl http://localhost:5000/expenses
```

### Create Expense
```bash
curl -X POST http://localhost:5000/expenses ^
  -H "Content-Type: application/json" ^
  -d "{\"id\": \"e888\", \"dept_id\": \"d1\", \"category\": \"Software Licenses\", \"amount\": 5000, \"month\": \"2025-10\", \"description\": \"Test Software\"}"
```

---

## 💻 Method 3: Using Postman (Recommended)

### 1. Download Postman: https://www.postman.com/downloads/

### 2. Create Collection: IT-BUDGET-BUDDY API

### 3. Add Requests

#### Request 1: Login
- **URL:** `http://localhost:5000/login`
- **Method:** POST
- **Headers:** Content-Type: application/json
- **Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

#### Request 2: Get Departments
- **URL:** `http://localhost:5000/departments`
- **Method:** GET

#### Request 3: Create Expense
- **URL:** `http://localhost:5000/expenses`
- **Method:** POST
- **Headers:** Content-Type: application/json
- **Body:**
```json
{
  "id": "e888",
  "dept_id": "d1",
  "category": "Software Licenses",
  "amount": 5000,
  "month": "2025-10",
  "description": "HR Training Software"
}
```

#### Request 4: Get All Expenses
- **URL:** `http://localhost:5000/expenses`
- **Method:** GET

#### Request 5: Dashboard Admin
- **URL:** `http://localhost:5000/dashboard/admin`
- **Method:** GET

---

## 📊 Expected Response Examples

### Success Response (Login)
```json
{
  "status": "success",
  "user": {
    "id": "u1",
    "username": "admin",
    "display_name": "IT Manager",
    "role": "admin",
    "dept_id": null
  }
}
```

### Success Response (Get Departments)
```json
{
  "status": "success",
  "departments": [
    {
      "id": "d1",
      "name": "HR",
      "budget": 50000,
      "created_at": "2025-02-12T10:00:00",
      "updated_at": "2025-02-12T10:00:00"
    },
    {
      "id": "d2",
      "name": "Cloud Infrastructure",
      "budget": 120000,
      "created_at": "2025-02-12T10:00:00",
      "updated_at": "2025-02-12T10:00:00"
    }
  ]
}
```

### Created Response
```json
{
  "status": "success",
  "message": "Expense created",
  "id": "e888"
}
```

### Error Response
```json
{
  "status": "failed",
  "message": "Invalid credentials"
}
```

---

## ✅ Data Verification in MySQL

### After creating new data via API, verify in MySQL:

```sql
-- Check new expense
USE it_budget_buddy;
SELECT * FROM expenses WHERE id = 'e888';

-- Check all expenses for a department
SELECT * FROM expenses WHERE dept_id = 'd1' ORDER BY month DESC;

-- Check total spending per department
SELECT 
    d.name,
    COUNT(e.id) as expense_count,
    SUM(e.amount) as total_spent
FROM departments d
LEFT JOIN expenses e ON d.id = e.dept_id
GROUP BY d.name;

-- Check new user
SELECT * FROM users WHERE id = 'u99';

-- Check new department
SELECT * FROM departments WHERE id = 'd99';
```

---

## 🔄 Complete Data Flow Test

Follow this sequence to verify everything works:

1. **Start Backend**
   ```powershell
   python app.py
   ```

2. **Test Connection**
   ```powershell
   Invoke-WebRequest -Uri "http://localhost:5000/test-connection"
   ```

3. **Login**
   ```powershell
   # Use the Test 3 PowerShell command above
   ```

4. **Get Current Data**
   ```powershell
   # Use Test 7 (Get Expenses)
   ```

5. **Create New Expense**
   ```powershell
   # Use Test 11 command
   ```

6. **Verify in API**
   ```powershell
   # Use Test 8 to check if new expense appears
   ```

7. **Verify in MySQL**
   ```sql
   SELECT * FROM it_budget_buddy.expenses WHERE id = 'e999';
   ```

**If you see your new data in all three places (API, database), everything works! ✅**

---

## 🚨 Common Test Failures & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "Connection refused" | Backend not running | Run `python app.py` |
| "Cannot connect to MySQL" | Database down | Check MySQL service |
| "Invalid credentials" | Wrong username/password | Use test credentials above |
| "Expense not found" | Wrong ID | Use correct expense ID |
| "CORS error" | Frontend/domain issue | CORS is already enabled in app.py |
| "No module flask" | Dependencies missing | Run `pip install -r requirements.txt` |

---

## 🎯 Test Checklist

Complete these tests to ensure everything works:

- [ ] Health check returns endpoints list
- [ ] Database connection successful
- [ ] Admin login works
- [ ] HR user login works
- [ ] Get all departments returns 5 items
- [ ] Get all users returns 6 items
- [ ] Get all expenses returns 29 items
- [ ] Get expenses by dept_id filters correctly
- [ ] Get all licenses returns 7 items
- [ ] Create new expense returns success
- [ ] New expense appears in GET /expenses
- [ ] New expense appears in MySQL database
- [ ] Update expense works
- [ ] Update license usage works
- [ ] Create new user works
- [ ] Create new department works
- [ ] Department dashboard returns data
- [ ] Admin dashboard returns data

---

**All tests passing? Congratulations! Your backend is fully functional! 🎉**

Next: Integrate these API endpoints into your React frontend.
