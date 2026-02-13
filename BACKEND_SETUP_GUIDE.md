# 🚀 Backend Setup & API Integration Guide

## 📋 What You Have

Your backend is now configured with:
- ✅ **Flask API Server** (Python)
- ✅ **MySQL Database Connection** (it_budget_buddy)
- ✅ **12+ API Endpoints** (fully functional)
- ✅ **CORS Enabled** (for frontend communication)
- ✅ **Automatic Data Storage** to MySQL

---

## 🔧 Step 1: Install Dependencies

### Option A: Using PowerShell (Recommended)
```powershell
# Navigate to backend folder
cd C:\Users\Rithanya\Desktop\IT-BUDGET-BUDDY\backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Install packages
pip install -r requirements.txt
```

### Option B: Using Command Prompt (CMD)
```cmd
cd C:\Users\Rithanya\Desktop\IT-BUDGET-BUDDY\backend
python -m venv .venv
.venv\Scripts\activate.bat
pip install -r requirements.txt
```

**Installation will take 2-3 minutes.**

---

## 📝 Step 2: Verify MySQL Database

Before running the backend, make sure:

1. **MySQL Server is Running**
   - Windows: Search for "Services" → Find "MySQL80" (or your version) → Verify it shows "Running"
   - OR use terminal: `mysql -u root -p` (enter password: Rithanya2026)

2. **Database is Created**
   - You should have created this from the previous SQL script
   - If not done, run DATABASE_SETUP.sql in MySQL Workbench first

3. **Test Connection** (Optional)
   ```powershell
   mysql -h localhost -u root -p
   # Password: Rithanya2026
   
   # Inside MySQL prompt:
   USE it_budget_buddy;
   SELECT COUNT(*) FROM users;
   EXIT;
   ```

---

## ▶️ Step 3: Run Backend Server

### Start the Flask Server
```powershell
# Make sure you're in the backend folder with venv activated
python app.py
```

**Expected Output:**
```
 * Serving Flask app 'app'
 * Debug mode: on
 * Running on http://127.0.0.1:5000
 * Press CTRL+C to quit
 ```

**✅ Server is running! Don't close this terminal.**

---

## 🧪 Step 4: Test API Endpoints

### Open a NEW terminal/PowerShell window and test:

#### Test 1: Health Check
```powershell
$uri = "http://localhost:5000/"
Invoke-WebRequest -Uri $uri | ConvertTo-Json
```
**Expected:** Shows API endpoints list

#### Test 2: Test Database Connection
```powershell
$uri = "http://localhost:5000/test-connection"
Invoke-WebRequest -Uri $uri | ConvertTo-Json
```
**Expected:** `"message": "Connected to MySQL database successfully"`

#### Test 3: Get All Departments
```powershell
$uri = "http://localhost:5000/departments"
Invoke-WebRequest -Uri $uri | ConvertTo-Json
```
**Expected:** Returns 5 departments (HR, Cloud Infrastructure, etc.)

#### Test 4: Login Test
```powershell
$uri = "http://localhost:5000/login"
$body = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

Invoke-WebRequest -Uri $uri -Method POST -Body $body -ContentType "application/json" | ConvertTo-Json
```
**Expected:** Returns admin user object

#### Test 5: Get All Users
```powershell
$uri = "http://localhost:5000/users"
Invoke-WebRequest -Uri $uri | ConvertTo-Json
```
**Expected:** Returns 6 users

#### Test 6: Get All Expenses
```powershell
$uri = "http://localhost:5000/expenses"
Invoke-WebRequest -Uri $uri | ConvertTo-Json
```
**Expected:** Returns 29 expenses

#### Test 7: Get Licenses
```powershell
$uri = "http://localhost:5000/licenses"
Invoke-WebRequest -Uri $uri | ConvertTo-Json
```
**Expected:** Returns 7 licenses

---

## 📊 API Endpoints Reference

### 🔑 Authentication
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/login` | POST | Login user (returns user info) |

**Login Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

### 🏢 Departments
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/departments` | GET | Get all departments |
| `/departments` | POST | Create new department |

**Create Department Body:**
```json
{
  "id": "d6",
  "name": "IT Operations",
  "budget": 85000
}
```

### 👥 Users
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/users` | GET | Get all users |
| `/users` | POST | Create new user |

**Create User Body:**
```json
{
  "id": "u7",
  "username": "ops_user",
  "password": "pass123",
  "display_name": "Ops Manager",
  "role": "department",
  "dept_id": "d1"
}
```

### 💰 Expenses
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/expenses` | GET | Get all/filtered expenses |
| `/expenses?dept_id=d1` | GET | Get expenses by department |
| `/expenses/<id>` | GET | Get single expense |
| `/expenses` | POST | Create expense |
| `/expenses/<id>` | PUT | Update expense |

**Create Expense Body:**
```json
{
  "id": "e30",
  "dept_id": "d2",
  "category": "Cloud",
  "amount": 25000,
  "month": "2025-10",
  "description": "AWS monthly + new regions"
}
```

**Update Expense Body:**
```json
{
  "category": "Cloud",
  "amount": 26000,
  "description": "AWS monthly + updated"
}
```

### 📜 Licenses
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/licenses` | GET | Get all licenses |
| `/licenses?dept_id=d3` | GET | Get licenses by department |
| `/licenses` | POST | Create license |
| `/licenses/<id>` | PUT | Update license usage |

**Create License Body:**
```json
{
  "id": "l8",
  "dept_id": "d2",
  "software": "New Software",
  "total_purchased": 50,
  "used": 30,
  "cost_per_license": 200
}
```

**Update License Body:**
```json
{
  "used": 35
}
```

### 📈 Dashboards
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/dashboard/department/<dept_id>` | GET | Department overview |
| `/dashboard/admin` | GET | Admin overview |

---

## Testing with Postman/Insomnia

### 1. Download Postman (Free)
- Visit: https://www.postman.com/downloads/

### 2. Import Collection
Create requests with:
- **Base URL:** `http://localhost:5000`
- **Headers:** `Content-Type: application/json`
- **Examples:** See endpoints above

### 3. Test Each Endpoint
- Click "Send" button
- Verify green "200 OK" responses
- Check returned data

---

## 🔄 Using with Frontend (React)

### Update Your React Context/API Calls

**Replace mock data with API calls:**

**Before (Mock Data):**
```javascript
const [departments, setDepartments] = useState(initialDepartments);
```

**After (Real API):**
```javascript
useEffect(() => {
  fetch('http://localhost:5000/departments')
    .then(res => res.json())
    .then(data => setDepartments(data.departments))
    .catch(err => console.error(err));
}, []);
```

### Login Example
```javascript
const handleLogin = async (username, password) => {
  const response = await fetch('http://localhost:5000/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await response.json();
  if (data.status === 'success') {
    setCurrentUser(data.user);
  }
};
```

### Create Expense Example
```javascript
const handleCreateExpense = async (expense) => {
  const response = await fetch('http://localhost:5000/expenses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(expense)
  });
  const data = await response.json();
  if (data.status === 'success') {
    console.log('Expense created:', data.id);
  }
};
```

---

## ✅ Data Flow Verification

1. **Create New Expense via API:**
   ```powershell
   $body = @{
       id = "e999"
       dept_id = "d1"
       category = "Cloud"
       amount = 15000
       month = "2025-10"
       description = "Test expense"
   } | ConvertTo-Json
   
   Invoke-WebRequest -Uri "http://localhost:5000/expenses" -Method POST -Body $body -ContentType "application/json"
   ```

2. **Check MySQL Database:**
   ```sql
   USE it_budget_buddy;
   SELECT * FROM expenses WHERE id = 'e999';
   ```

3. **Verify Data is Stored:**
   - Should see your new expense in the expenses table
   - Check: id, dept_id, category, amount, month, description

---

## 🐛 Troubleshooting

### Error: "Connection refused"
```
❌ Error: Cannot connect to MySQL
✅ Solution: 
   1. Check MySQL is running (Services window)
   2. Verify database name is 'it_budget_buddy'
   3. Check username/password in app.py (should be: root / Rithanya2026)
```

### Error: "No module named 'flask'"
```
❌ Error: ModuleNotFoundError
✅ Solution:
   1. Activate virtual environment: .\.venv\Scripts\Activate.ps1
   2. Run: pip install -r requirements.txt
```

### Error: "Port 5000 already in use"
```
❌ Error: Address already in use
✅ Solution:
   1. Kill existing process: taskkill /F /IM python.exe
   2. OR change port in app.py: app.run(port=5001)
```

### Error: "Access denied for user 'root'"
```
❌ Error: MySQL authentication failed
✅ Solution:
   1. Check password in app.py (3rd line of DB_CONFIG)
   2. Verify: mysql -u root -p (enter: Rithanya2026)
```

### Database shows no data
```
❌ Error: Tables/data missing
✅ Solution:
   1. Run DATABASE_SETUP.sql in MySQL Workbench
   2. Verify with: SELECT COUNT(*) FROM users;
```

---

## 🚀 Full Integration Checklist

- [ ] Python installed (python --version)
- [ ] Virtual environment created (.venv folder exists)
- [ ] Dependencies installed (pip install -r requirements.txt)
- [ ] MySQL database created (it_budget_buddy)
- [ ] Database tables populated (47 records)
- [ ] Backend started (python app.py)
- [ ] Health check passed (/test-connection)
- [ ] Login API working (/login)
- [ ] Can fetch departments (/departments)
- [ ] Can create new expense (POST /expenses)
- [ ] Data appears in MySQL database
- [ ] Frontend can call API endpoints
- [ ] No CORS errors in browser console

---

## 📁 File Structure

```
backend/
├── .venv/                    ← Virtual environment
├── app.py                    ← Main Flask application ✅ UPDATED
├── models.py                 ← Database models
├── requirements.txt          ← Dependencies ✅ CREATED
└── README.md                 ← Documentation
```

---

## 🎓 Next Steps

1. ✅ Install dependencies
2. ✅ Start backend server
3. ✅ Test API endpoints
4. ✅ Update React frontend with API calls
5. ✅ Verify data in MySQL
6. ✅ Deploy to production

---

## 📞 API Response Format

All responses follow this format:

**Success Response:**
```json
{
  "status": "success",
  "data": {...}  // or users, departments, expenses, etc.
}
```

**Error Response:**
```json
{
  "status": "failed",
  "message": "Error description"
}
```

---

## ⚡ Performance Tips

1. **Use query parameters for filtering:**
   - `GET /expenses?dept_id=d1` ← Filters by department

2. **Implement pagination in future:**
   - `GET /expenses?page=1&limit=50`

3. **Add caching for dashboards:**
   - Cache admin dashboard results (updates every 5 minutes)

4. **Use connection pooling:**
   - Current setup is good for small-medium apps
   - Upgrade to pooling for 1000+ concurrent users

---

**Backend is now fully set up and ready! 🎉**

Run `python app.py` and start integrating with your React frontend!
