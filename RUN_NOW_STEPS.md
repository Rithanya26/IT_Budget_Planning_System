# ⚡ RUN NOW - Immediate Action Steps (Copy-Paste Ready)

## DO THIS RIGHT NOW (Next 5 minutes)

### STEP 1: Open PowerShell Terminal (2 minutes)

```powershell
# Copy-paste this entire block into PowerShell:

# Navigate to backend
cd "C:\Users\Rithanya\Desktop\IT-BUDGET-BUDDY\backend"

# Create virtual environment (if not exists)
if (-not (Test-Path ".venv")) {
    python -m venv .venv
    Write-Host "Virtual environment created"
} else {
    Write-Host "Virtual environment already exists"
}

# Activate virtual environment
& ".\.venv\Scripts\Activate.ps1"

# Install dependencies
pip install -r requirements.txt

# Start backend server
python app.py
```

**Expected Output:**
```
 * Running on http://127.0.0.1:5000
 * Press CTRL+C to quit
```

**⚠️ DO NOT CLOSE THIS TERMINAL - Let it keep running**

---

### STEP 2: Open SECOND PowerShell Terminal (while first keeps running)

**⚠️ Click "New" in Terminal Window or Right-click → New Tab**

```powershell
# Copy-paste this to test if backend is working:

Write-Host "Testing Backend..."

# Test 1: Health Check
Write-Host "`n=== Health Check ==="
(Invoke-WebRequest -Uri "http://localhost:5000/").Content

# Test 2: Database Connection
Write-Host "`n=== Database Connection ==="
(Invoke-WebRequest -Uri "http://localhost:5000/test-connection").Content | ConvertFrom-Json

# Test 3: Test Login
Write-Host "`n=== Login Test ==="
$body = @{ username = "admin"; password = "admin123" } | ConvertTo-Json
(Invoke-WebRequest -Uri "http://localhost:5000/login" -Method POST -Body $body -ContentType "application/json").Content | ConvertFrom-Json

# Test 4: Get Departments
Write-Host "`n=== Departments ==="
(Invoke-WebRequest -Uri "http://localhost:5000/departments").Content | ConvertFrom-Json | ConvertTo-Json

# Test 5: Get Users
Write-Host "`n=== Users ==="
(Invoke-WebRequest -Uri "http://localhost:5000/users").Content | ConvertFrom-Json | ConvertTo-Json

# Test 6: Get Expenses
Write-Host "`n=== Expenses Count ==="
$expenses = (Invoke-WebRequest -Uri "http://localhost:5000/expenses").Content | ConvertFrom-Json
Write-Host "Total expenses: $($expenses.expenses.Count)"

# Test 7: Get Licenses
Write-Host "`n=== Licenses ==="
(Invoke-WebRequest -Uri "http://localhost:5000/licenses").Content | ConvertFrom-Json | ConvertTo-Json

Write-Host "`n✅ All tests completed! Backend is working!"
```

---

### STEP 3: Create New Test Entry in Database (1 minute)

**Continue in the SECOND PowerShell:**

```powershell
# Create a test expense to verify data is stored
Write-Host "`nCreating test expense..."

$testId = "test_$(Get-Date -Format 'yyyyMMddHHmmss')"
$body = @{
    id = $testId
    dept_id = "d1"
    category = "Software Licenses"
    amount = 12500
    month = "2025-02"
    description = "Test entry from PowerShell API"
} | ConvertTo-Json

$response = (Invoke-WebRequest -Uri "http://localhost:5000/expenses" -Method POST -Body $body -ContentType "application/json").Content | ConvertFrom-Json

Write-Host "Response: $($response | ConvertTo-Json)"
Write-Host "`n✅ Test entry created with ID: $testId"
Write-Host "Now checking if it appears in database..."

# Verify in Microsoft Azure (optional, requires MySQL installed locally)
Write-Host "`nTo verify in MySQL, run this in a new terminal:"
Write-Host "mysql -u root -p"
Write-Host "Password: Rithanya2026"
Write-Host "USE it_budget_buddy;"
Write-Host "SELECT * FROM expenses WHERE id LIKE 'test_%' ORDER BY created_at DESC LIMIT 1;"
```

---

### STEP 4: Verify in MySQL (1 minute)

**Open PowerShell Terminal 3:**

```powershell
# Connect to MySQL and verify data was stored
mysql -u root -p
```

When prompted for password, type: `Rithanya2026`

Then in MySQL:

```sql
USE it_budget_buddy;

-- Check if your test entry exists
SELECT id, dept_id, category, amount, month FROM expenses 
WHERE id LIKE 'test_%' 
ORDER BY created_at DESC LIMIT 1;

-- Should show something like:
-- test_20250212153045 | d1 | Software Licenses | 12500 | 2025-02 |

-- View all expenses
SELECT COUNT(*) as total_expenses FROM expenses;
-- Should show: 30 (original 29 + 1 new)

EXIT;
```

**If you see your test entry, congratulations! Data is flowing correctly! ✅**

---

## 🎯 VERIFICATION CHECKLIST

After completing above 4 steps, check:

```powershell
# Terminal 1: Backend should be running
# ✅ Shows: "Running on http://127.0.0.1:5000"

# Terminal 2: All tests should show data
# ✅ Login returned user object
# ✅ Departments returned 5 items
# ✅ Users returned 6 items
# ✅ Expenses returned 29+ items
# ✅ Licenses returned 7 items

# Terminal 3 (MySQL): Test entry exists
# ✅ Can see test_* entry in database
# ✅ Total expense count increased by 1
```

---

## 🚀 NEXT: Start React Frontend

**Open Terminal 4:**

```powershell
# Navigate to frontend
cd "C:\Users\Rithanya\Desktop\IT-BUDGET-BUDDY\frontend\it-budget-buddy-63"

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

**Output should show:**
```
Local:   http://localhost:5173/
```

---

## 📋 What You Should Have Running

By this point, you should have:

```
Terminal 1: ✅ Backend running (python app.py)
Terminal 2: ✅ Available for testing/monitoring
Terminal 3: ✅ Available for MySQL queries
Terminal 4: ✅ Frontend running (npm run dev)
```

---

## 🧪 QUICK TEST: Create Expense via Browser

1. Open http://localhost:5173
2. Login with:
   - Username: `admin`
   - Password: `admin123`
3. Navigate to the expenses section
4. Create a new expense (if UI has this option)
5. Check MySQL database:
   ```sql
   USE it_budget_buddy;
   SELECT * FROM expenses ORDER BY created_at DESC LIMIT 1;
   ```

**If you see your expense in MySQL, everything is connected! 🎉**

---

## 🐛 TROUBLESHOOTING QUICK FIXES

### Issue: "Address already in use" or "Port 5000 in use"
```powershell
# Kill existing process
taskkill /F /IM python.exe

# Then restart: python app.py
```

### Issue: "Cannot connect to MySQL"
```powershell
# Check MySQL is running
mysql -u root -p
# Password: Rithanya2026

# If fails, start MySQL service (Windows)
# Right-click MySQL80 → Start Service
```

### Issue: "No module named flask"
```powershell
# Make sure venv is activated
& ".\.venv\Scripts\Activate.ps1"

# Then install
pip install -r requirements.txt
```

### Issue: Frontend shows error "Cannot reach API"
```
Make sure:
1. Backend is running on terminal 1
2. Backend URL is http://localhost:5000 (not https)
3. Check browser console for exact error
4. Check Network tab in DevTools
```

---

## 📊 Expected Data Count

| Table | Initial | After Test |
|-------|---------|-----------|
| departments | 5 | 5 |
| users | 6 | 6 |
| expenses | 29 | 30 (+1 test) |
| licenses | 7 | 7 |

---

## ✨ SUCCESS INDICATORS

✅ **Backend Working:**
- Terminal 1 shows "Running on http://127.0.0.1:5000"
- Terminal 2 tests return JSON data
- No error messages in Terminal 1

✅ **Database Connected:**
- Terminal 2 login test returns user object
- Test entry appears in MySQL
- MySQL shows correct row counts

✅ **Frontend Ready:**
- Terminal 4 shows "Local: http://localhost:5173"
- React components load without errors

✅ **Data Flowing:**
- Create action via frontend
- Data appears in MySQL
- API returns updated list

---

## 🎉 YOU ARE DONE!

Once all above checks pass:

1. ✅ Backend is running and handling requests
2. ✅ Database is storing data automatically
3. ✅ Frontend will connect to real backend (after integration)
4. ✅ Data syncs between UI ↔ API ↔ MySQL

**Next:** Update React components to use API (see FRONTEND_INTEGRATION_GUIDE.md)

---

## 📞 Need Help?

| Problem | File to Check |
|---------|--------------|
| Backend setup | BACKEND_SETUP_GUIDE.md |
| API details | BACKEND_API_TESTING.md |
| Database | MYSQL_SETUP_GUIDE.md |
| Frontend integration | FRONTEND_INTEGRATION_GUIDE.md |
| Architecture overview | SETUP_COMPLETE_SUMMARY.md |

---

**That's it! Your backend is live! 🚀**

Keep Terminal 1 running and proceed with frontend integration.
