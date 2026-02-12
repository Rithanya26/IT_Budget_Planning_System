# 🗄️ MySQL Database Setup Guide for IT-BUDGET-BUDDY

## 📊 Database Overview

Your IT-BUDGET-BUDDY application requires **4 main tables**:

| Table | Purpose | Records |
|-------|---------|---------|
| **departments** | Store department information | 5 |
| **users** | Store user accounts & authentication | 6 |
| **expenses** | Track IT expenses by category & month | 29 |
| **licenses** | Track software licenses usage | 7 |

**Total Initial Data:**  
- 4 Tables  
- 47 Total Records
- Foreign Key Relationships: Users & Expenses depend on Departments, Licenses depend on Departments

---

## 🚀 Step-by-Step Setup Instructions

### **Step 1: Open MySQL Workbench**
1. Launch **MySQL Workbench** on your computer
2. Click on your MySQL Server connection (or create one if needed)
3. Enter your MySQL password
4. Click **"Connect"**

---

### **Step 2: Create New Query Tab**
1. Click **File** → **New Query Tab** (or press `Ctrl + T`)
2. A blank SQL editor window will open

---

### **Step 3: Copy and Paste SQL Script**
1. Open the file: `DATABASE_SETUP.sql` from your project root
2. Copy ALL the contents
3. Paste it into the MySQL Workbench query editor
   - OR use File → Open SQL Script and select `DATABASE_SETUP.sql`

---

### **Step 4: Execute the Script**
1. Select all text in the editor (Ctrl + A)
2. Click the **Lightning Bolt ⚡** button (Execute) in the toolbar
   - OR press **Ctrl + Shift + Enter**
3. Watch the output panel at the bottom to verify success

**You should see:**
```
0 row(s) created
0 row(s) created  [Departments table created]
0 row(s) created  [Users table created]
0 row(s) created  [Expenses table created]
0 row(s) created  [Licenses table created]
5 row(s) affected  [5 departments inserted]
6 row(s) affected  [6 users inserted]
12 row(s) affected [HR expenses inserted]
6 row(s) affected  [Cloud Infrastructure expenses inserted]
6 row(s) affected  [Software Development expenses inserted]
5 row(s) affected  [Finance expenses inserted]
6 row(s) affected  [Security expenses inserted]
7 row(s) affected  [7 licenses inserted]
```

---

### **Step 5: Verify Database Creation**
1. In the **Navigator** panel (left side), look for your schemas
2. If the schema list doesn't refresh:
   - Click **View** → **Refresh All** 
   - OR press **F5**
3. You should now see **`it_budget_buddy`** database listed
4. Expand it to see all 4 tables:
   - ✅ departments
   - ✅ users
   - ✅ expenses
   - ✅ licenses

---

### **Step 6: View Tables (Optional Verification)**
Run these queries to verify all data:

```sql
-- View departments
SELECT * FROM it_budget_buddy.departments;

-- View users  
SELECT * FROM it_budget_buddy.users;

-- View all expenses
SELECT * FROM it_budget_buddy.expenses;

-- View licenses
SELECT * FROM it_budget_buddy.licenses;
```

---

## 📋 Table Schema Details

### **Table 1: departments**
```
id (VARCHAR 50) - Primary Key
name (VARCHAR 100) - Unique department name
budget (DECIMAL 12,2) - Department budget
created_at (TIMESTAMP) - Auto-generated
updated_at (TIMESTAMP) - Auto-updated
```

### **Table 2: users**
```
id (VARCHAR 50) - Primary Key
username (VARCHAR 50) - Unique login username
password (VARCHAR 255) - Hashed password (should be encrypted in production!)
display_name (VARCHAR 100) - User's display name
role (ENUM) - 'admin' or 'department'
dept_id (VARCHAR 50) - Foreign Key to departments (NULL for admin)
is_active (BOOLEAN) - User status flag
created_at (TIMESTAMP) - Auto-generated
updated_at (TIMESTAMP) - Auto-updated
```

### **Table 3: expenses**
```
id (VARCHAR 50) - Primary Key
dept_id (VARCHAR 50) - Foreign Key to departments
category (ENUM) - 'Cloud', 'Software Licenses', 'Hardware', 'Maintenance'
amount (DECIMAL 10,2) - Expense amount
month (VARCHAR 7) - Format: YYYY-MM (e.g., 2025-04)
description (TEXT) - Expense details
created_at (TIMESTAMP) - Auto-generated
updated_at (TIMESTAMP) - Auto-updated
Indexes: dept_id, category, month, (dept_id, month)
```

### **Table 4: licenses**
```
id (VARCHAR 50) - Primary Key
dept_id (VARCHAR 50) - Foreign Key to departments
software (VARCHAR 100) - Software name
total_purchased (INT) - Total licenses bought
used (INT) - Currently in use
cost_per_license (DECIMAL 10,2) - Cost per license
created_at (TIMESTAMP) - Auto-generated
updated_at (TIMESTAMP) - Auto-updated
Indexes: dept_id, software
```

---

## 🔑 Important Notes

### ⚠️ Security Considerations
1. **Passwords are currently PLAIN TEXT** - Before production:
   - Hash passwords using bcrypt, scrypt, or Argon2
   - Never store plain text passwords
   - Use prepared statements to prevent SQL injection

2. **Use Connection Pooling** for your backend
   - Configure in your Node.js/Backend server

### 📌 Default Login Credentials (for testing)
```
Admin:
- Username: admin
- Password: admin123

HR User:
- Username: hr_user  
- Password: pass123

Cloud Infrastructure:
- Username: cloud_user
- Password: pass123

Development:
- Username: dev_user
- Password: pass123

Finance:
- Username: finance_user
- Password: pass123

Security:
- Username: security_user
- Password: pass123
```

---

## 🔄 Adding New Data

### Add a new department:
```sql
INSERT INTO it_budget_buddy.departments (id, name, budget) 
VALUES ('d6', 'IT Operations', 85000);
```

### Add a new user:
```sql
INSERT INTO it_budget_buddy.users (id, username, password, display_name, role, dept_id) 
VALUES ('u7', 'ops_user', 'pass123', 'Ops Manager', 'department', 'd6');
```

### Add a new expense:
```sql
INSERT INTO it_budget_buddy.expenses (id, dept_id, category, amount, month, description) 
VALUES ('e30', 'd2', 'Cloud', 23500, '2025-10', 'AWS monthly + new regions');
```

### Update a license usage:
```sql
UPDATE it_budget_buddy.licenses 
SET used = 25 
WHERE id = 'l2';
```

---

## 🐛 Troubleshooting

### Problem: "Access denied for user"
- **Solution:** Check your MySQL username/password in Workbench connection settings

### Problem: Tables already exist error
- **Solution:** Run `DROP DATABASE IF EXISTS it_budget_buddy;` first, then re-run the full script

### Problem: Foreign key constraint error
- **Solution:** Ensure departments exist before creating users/expenses (the script handles this in correct order)

### Problem: Data not showing in Navigator
- **Solution:** Press F5 or right-click the Schemas folder → "Refresh All"

---

## ✅ Verification Checklist

- [ ] Database `it_budget_buddy` created
- [ ] 4 tables created: departments, users, expenses, licenses
- [ ] 5 departments inserted
- [ ] 6 users inserted
- [ ] 29 expenses inserted
- [ ] 7 licenses inserted
- [ ] Foreign key relationships working
- [ ] Can query data successfully
- [ ] Indexes created for performance

---

## 📞 Next Steps

1. **Update your backend** to connect to this MySQL database
2. **Replace mock data** in your React context with API calls
3. **Configure database connection** in your backend (host, port, user, password)
4. **Test API endpoints** with real database queries

---

**Database setup complete! 🎉**
