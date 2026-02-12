# ⚡ Quick Start - MySQL Setup for IT-BUDGET-BUDDY

## 🎯 5-Minute Setup

### What You Get:
✅ **4 Database Tables**
- Categories: Users, Departments, Expenses, Licenses

✅ **47 Pre-loaded Records**
- 5 Departments  
- 6 Users (with login credentials)
- 29 Expenses (sample data from April-September 2025)
- 7 Software Licenses (with usage tracking)

✅ **Complete Schema**
- Foreign keys & cascading rules
- Performance indexes
- Timestamps for audit trail

---

## 📁 Files Provided

1. **DATABASE_SETUP.sql** ← USE THIS FIRST
   - Contains all SQL to create database, tables, and insert data
   - Copy & paste into MySQL Workbench

2. **MYSQL_SETUP_GUIDE.md**
   - Step-by-step instructions for MySQL Workbench
   - Default login credentials
   - Troubleshooting guide

3. **DATABASE_REFERENCE.md**
   - Advanced queries for backend integration
   - ERD diagram & relationships
   - Security & optimization tips

---

## 🚀 Fastest Path to Success

### Step 1: Open MySQL Workbench
```
1. Launch MySQL Workbench
2. Connect to your MySQL server
3. Open File → New Query Tab (Ctrl+T)
```

### Step 2: Copy SQL Script
```
1. Open: DATABASE_SETUP.sql
2. Select All (Ctrl+A) → Copy (Ctrl+C)
3. Paste into Workbench query tab
```

### Step 3: Execute
```
Click Execute (⚡) button or press Ctrl+Shift+Enter
Watch for "47 row(s) affected" in output
```

### Step 4: Verify
```
In Navigator panel (left), expand:
- it_budget_buddy
  ├── departments (5 rows)
  ├── users (6 rows)
  ├── expenses (29 rows)
  └── licenses (7 rows)
```

**Done! ✅ Your database is ready!**

---

## 🧪 Test Your Setup

### Query 1: Verify all tables exist
```sql
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'it_budget_buddy';
```

### Query 2: Count all records
```sql
SELECT 
    'departments' as table_name, COUNT(*) as rows FROM departments
UNION ALL SELECT 'users', COUNT(*) FROM users
UNION ALL SELECT 'expenses', COUNT(*) FROM expenses
UNION ALL SELECT 'licenses', COUNT(*) FROM licenses;
```

### Query 3: Test login
```sql
SELECT * FROM users WHERE username = 'admin';
-- Should return: u1, admin, admin123, IT Manager, admin
```

---

## 👤 Test User Accounts

| Username | Password | Role | Department |
|----------|----------|------|-----------|
| **admin** | admin123 | Admin | (None) |
| **hr_user** | pass123 | Department | HR |
| **cloud_user** | pass123 | Department | Cloud Infrastructure |
| **dev_user** | pass123 | Department | Software Development |
| **finance_user** | pass123 | Department | Finance |
| **security_user** | pass123 | Department | Security |

---

## 💡 Key Database Features

### Relationships (Foreign Keys)
```
Users → Department (1:Many)
Expenses → Department (1:Many) [Cascade Delete]
Licenses → Department (1:Many) [Cascade Delete]
```

### Auto-Generated Columns
- `created_at` - Set when record is created
- `updated_at` - Updates automatically on changes

### Data Integrity
- Unique usernames & department names
- Valid categories: Cloud, Software Licenses, Hardware, Maintenance
- Valid roles: admin, department
- Month format: YYYY-MM (e.g., 2025-04)

---

## 📝 Common Operations

### Add New Department
```sql
INSERT INTO departments (id, name, budget) 
VALUES ('d6', 'New Department', 100000);
```

### Add New User
```sql
INSERT INTO users (id, username, password, display_name, role, dept_id) 
VALUES ('u7', 'newuser', 'pass123', 'John Doe', 'department', 'd1');
```

### Record New Expense
```sql
INSERT INTO expenses (id, dept_id, category, amount, month, description) 
VALUES ('e30', 'd2', 'Cloud', 25000, '2025-10', 'AWS monthly');
```

### Update License Usage
```sql
UPDATE licenses SET used = 50 WHERE id = 'l1';
```

---

## ⚠️ Important Notes for Production

### Security
- 🔴 **PASSWORDS ARE PLAIN TEXT** - Hash them before production!
- 🟢 Use bcrypt/Argon2 in your backend
- 🟢 Use prepared statements to prevent SQL injection
- 🟢 Never expose database credentials in code

### Performance
- Current schema supports ~100K+ expense records
- Add indexes if you scale beyond 1M records
- Use connection pooling in your backend
- Cache frequently accessed data (departments, budgets)

### Backups
- Schedule daily backups
- Test restore procedure monthly
- Keep 30-day backup retention

---

## 📞 Troubleshooting Quick Links

**"Access Denied"** → Check MySQL username/password in connection

**"Database already exists"** → Delete existing database first:
```sql
DROP DATABASE IF EXISTS it_budget_buddy;
```

**"Tables not showing"** → Refresh Navigator: Press F5 or right-click Schemas

**"Foreign key constraint error"** → Ensure departments exist before other tables

**Need more help?** → See MYSQL_SETUP_GUIDE.md for detailed guide

---

## 🎓 Next Steps

1. ✅ Create database (you just did!)
2. 📱 Update React frontend to connect to API
3. 🖥️ Build backend API (Node.js/Express/etc)
4. 🔐 Add password hashing & authentication
5. 📊 Connect dashboard to real data
6. 🚀 Deploy to production

---

## 📊 Database Size Estimates

| Metric | Current | After 1 Year | After 5 Years |
|--------|---------|-------------|--------------|
| Size | ~500 KB | ~5 MB | ~20 MB |
| Expenses | 29 | ~400 | ~2000 |
| Users | 6 | ~20 | ~50 |
| Licenses | 7 | ~15 | ~30 |

---

**Ready? Let's go! 🚀**

Questions? Check the other documentation files or review the SQL comments.
