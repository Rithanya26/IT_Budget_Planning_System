# 🖱️ MySQL Workbench Step-by-Step Visual Guide

## Part 1: Connect to MySQL

### Step 1.1: Launch MySQL Workbench
- Open MySQL Workbench on your computer
- You should see the **Home** screen with MySQL connections

### Step 1.2: Click on Your MySQL Connection
```
┌─────────────────────────────────────────┐
│  MySQL Connections                       │
├─────────────────────────────────────────┤
│                                          │
│  □ Local instance MySQL80        [Edit] │
│  □ Local instance MySQL57        [Edit] │
│                                          │
└─────────────────────────────────────────┘

👉 Click on "Local instance MySQL80" (or your connection)
```

### Step 1.3: Enter Password
```
┌─────────────────────┐
│ Connection Details  │
├─────────────────────┤
│ Password: [****  ] │
│                    │
│ [Cancel]  [OK]    │
└─────────────────────┘

👉 Enter your MySQL password
👉 Click OK
```

---

## Part 2: Create New Query Tab

**You should now be in the main Workbench editor**

### Step 2.1: Open New Query Tab
```
Top Menu: File → New Query Tab
OR Press: Ctrl + T
```

**You'll see:**
```
┌─────────────────────────────────────────────────────────┐
│ File Edit View Query Tools Help            [- □ X]      │
├─────────────────────────────────────────────────────────┤
│ [1] Query1          [+]      Navigator (F5)              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ SELECT * FROM table_name;  ← Blank query editor  │  │
│  │                                                  │  │
│  │                                                  │  │
│  │                                                  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Query Execution Complete                         │  │
│  │ 0 row(s) affected  [Results Grid]               │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Part 3: Copy SQL Script

### Step 3.1: Open DATABASE_SETUP.sql File
**Choose ONE method:**

**Method A: Using File Menu**
```
File → Open SQL Script
📁 Navigate to your project folder
↳ SELECT: DATABASE_SETUP.sql
✓ Click OPEN
```

**Method B: Copy-Paste (Recommended)**
```
1. Open DATABASE_SETUP.sql in any text editor (VS Code)
2. Select All: Ctrl + A
3. Copy: Ctrl + C
4. Click in Workbench query editor
5. Paste: Ctrl + V
```

---

## Part 4: Execute the Script

### Step 4.1: Select All SQL
```
In the query editor:
Ctrl + A  ← Select all text
```

### Step 4.2: Execute (Choose ONE)

**Option A: Click Execute Button** ⚡
```
┌─────────────────────────────────────────────┐
│ File Edit View Query Tools               [^]│
├─────────────────────────────────────────────┤
│ ⚡ 🔄 ⏸ 📋 🔍      ← toolbar buttons       │
├─────────────────────────────────────────────┤
│ [SQL script pasted here...]                 │
│                                             │
│ 👉 Click ⚡ (Lightning Bolt) icon          │
└─────────────────────────────────────────────┘
```

**Option B: Keyboard Shortcut**
```
Ctrl + Shift + Enter  ← Execute current statement
OR
Ctrl + Enter          ← Execute line/selection
```

### Step 4.3: Watch the Output

```
┌────────────────────────────────────────────┐
│ Output Panel (Bottom)                      │
├────────────────────────────────────────────┤
│ Query Execution Complete                   │
│ 0 row(s) affected  Finished in 0.234 sec  │
│                                            │
│ [✓] Query 1: CREATE DATABASE...   [OK]    │
│ [✓] Query 2: CREATE TABLE...      [OK]    │
│ [✓] Query 3: CREATE TABLE...      [OK]    │
│ [✓] Query 4: INSERT INTO...       5 rows │
│ [✓] Query 5: INSERT INTO...       6 rows │
│ │...more output...                        │
│ [✓] Final: SELECT * for verification      │
└────────────────────────────────────────────┘
```

**You should see green checkmarks ✓ for all queries**

---

## Part 5: Verify Database Creation

### Step 5.1: Refresh Navigator Panel
```
Navigator Panel (Left Side):
┌──────────────────────────┐
│ Navigator             [↑]│
├──────────────────────────┤
│ ▶ Schemas                │
│   ▶ information_schema   │
│   ▶ mysql               │
│   ▶ performance_schema   │
│   ▶ sys                 │
└──────────────────────────┘

👉 Press F5 (Refresh)
   OR Right-click Schemas → Refresh All
```

### Step 5.2: Look for it_budget_buddy

```
After refresh, you should see:

┌──────────────────────────┐
│ ▶ Schemas                │
│   ▶ information_schema   │
│   ▶ mysql               │
│   ▶ performance_schema   │
│   ▶ sys                 │
│   ▼ it_budget_buddy      │  ← NEW DATABASE!
│     ▶ Tables            │
│     └ Views             │
└──────────────────────────┘

👉 Click ▶ to expand Tables
```

### Step 5.3: View All Tables

```
After expanding Tables:

┌──────────────────────────────┐
│ ▼ Schemas                    │
│   ▼ it_budget_buddy          │
│     ▼ Tables                 │
│       ▼ departments    (5)   │  ← Shows row count
│       ▼ expenses       (29)  │
│       ▼ licenses       (7)   │
│       ▼ users          (6)   │
│     └ Views                  │
└──────────────────────────────┘
```

**Perfect! All 4 tables are created with data! ✅**

---

## Part 6: Preview the Data

### Step 6.1: Right-Click on Table

```
In Navigator, right-click on "departments":

┌────────────────────────────┐
│ ↪ Select All               │
│ ↪ Select Rows Limit 1000   │
│ ↪ Alter Table...           │
│ ↪ Drop Table...            │
│ ↪ Create Table Like...     │
│ ↪ ...other options...      │
└────────────────────────────┘

👉 Click "Select All"
```

### Step 6.2: View Results

```
The query editor will show:
SELECT * FROM `it_budget_buddy`.`departments`;

Results:
┌────┬─────────────────────┬─────────┐
│ id │ name                │ budget  │
├────┼─────────────────────┼─────────┤
│ d1 │ HR                  │ 50000   │
│ d2 │ Cloud Infrastructure│ 120000  │
│ d3 │ Software Dev        │ 90000   │
│ d4 │ Finance             │ 40000   │
│ d5 │ Security            │ 70000   │
└────┴─────────────────────┴─────────┘

Perfect! ✅
```

### Step 6.3: Check Users Table

```
Right-click users → Select All

Results:
┌────┬──────────────┬──────────┬──────────┬──────────┬────────┐
│ id │ username     │ password │ role     │ dept_id  │ ...    │
├────┼──────────────┼──────────┼──────────┼──────────┼────────┤
│ u1 │ admin        │ admin... │ admin    │ NULL     │        │
│ u2 │ hr_user      │ pass123  │ dept...  │ d1       │        │
│ u3 │ cloud_user   │ pass123  │ dept...  │ d2       │        │
│ u4 │ dev_user     │ pass123  │ dept...  │ d3       │        │
│ u5 │ finance_user │ pass123  │ dept...  │ d4       │        │
│ u6 │ security_... │ pass123  │ dept...  │ d5       │        │
└────┴──────────────┴──────────┴──────────┴──────────┴────────┘

✅ All 6 users loaded!
```

---

## Part 7: Run Test Queries

### Step 7.1: Create New Query Tab Again
```
Ctrl + T  ← New query tab
```

### Step 7.2: Test Login Query

```sql
-- Paste this in the new query:
SELECT * FROM it_budget_buddy.users 
WHERE username = 'admin' AND password = 'admin123';

-- Execute: Ctrl + Shift + Enter

-- Result should show: 1 row (admin user)
```

### Step 7.3: Check Budget vs Spending

```sql
SELECT 
    d.name as Department,
    d.budget,
    SUM(e.amount) as total_spent,
    (d.budget - SUM(e.amount)) as remaining
FROM it_budget_buddy.departments d
LEFT JOIN it_budget_buddy.expenses e ON d.id = e.dept_id
GROUP BY d.name, d.budget
ORDER BY remaining ASC;

-- Execute: Ctrl + Shift + Enter
```

---

## Part 8: Database Ready! ✅

### You now have:
- ✅ Database created: `it_budget_buddy`
- ✅ 4 tables with all fields
- ✅ 47 sample records pre-loaded
- ✅ Foreign key relationships
- ✅ Indexes for performance
- ✅ Timestamps for audit trail

---

## 🎓 Cheat Sheet - Common Actions

| Action | Keyboard | Mouse |
|--------|----------|-------|
| New Query Tab | Ctrl + T | File → New Query Tab |
| Execute Query | Ctrl + Shift + Enter | Click ⚡ button |
| Execute Line | Ctrl + Enter | Click line → ⚡ |
| Select All | Ctrl + A | Edit → Select All |
| Format SQL | Ctrl + B | Edit → Format |
| Find | Ctrl + F | Edit → Find |
| Go to Line | Ctrl + G | View → Go to Line |
| Comment Line | Ctrl + / | Edit → Toggle Comment |
| Refresh Navigator | F5 | Right-click → Refresh |
| Clear Results | Ctrl + Shift + Del | Click clear button |

---

## ✨ Pro Tips

**1. Save Your Queries**
```
File → Save → backup_queries.sql
Keep your SQL scripts for future reference
```

**2. Use Multi-Statement Execution**
```
Highlight multiple statements and press Ctrl+Shift+Enter
All queries run in sequence
```

**3. Create Bookmarks**
```
Click line numbers to bookmark frequently used queries
Helps you jump back quickly
```

**4. View Execution Plans**
```
Right-click query → Explain Query
See performance insights
```

**5. Export Data**
```
Right-click Results Grid → Export Data
Save as CSV, JSON, SQL, etc.
```

---

**🎉 Congrats! Your database is set up and ready to use!**

Next: Connect your backend to this database and start building your API! 🚀
