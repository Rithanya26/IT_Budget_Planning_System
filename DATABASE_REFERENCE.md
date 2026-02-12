# 🗂️ Database Schema Reference & ERD

## Entity Relationship Diagram (ERD)

```
┌─────────────────────┐
│   DEPARTMENTS       │
├─────────────────────┤
│ id (PK)             │
│ name                │ ◄──┐
│ budget              │    │ 1:N
│ created_at          │    │
│ updated_at          │    │
└─────────────────────┘    │
        △                   │
        │                   │
        │ 1:N               │
        │                   │
        ├───────────────────┤
        │                   │
        │                   │
┌─────────────────────┐    ┌──────────────────────────┐
│      USERS          │    │      EXPENSES            │
├─────────────────────┤    ├──────────────────────────┤
│ id (PK)             │    │ id (PK)                  │
│ username (UNIQUE)   │    │ dept_id (FK) ────────────┤──>[d1,d2,d3,d4,d5]
│ password            │    │ category (ENUM)          │
│ display_name        │    │ amount                   │
│ role (admin/dept)   │    │ month (YYYY-MM)          │
│ dept_id (FK) ───────┼────┤ description              │
│ is_active           │    │ created_at               │
│ created_at          │    │ updated_at               │
│ updated_at          │    └──────────────────────────┘
└─────────────────────┘

┌──────────────────────────┐
│      LICENSES            │
├──────────────────────────┤
│ id (PK)                  │
│ dept_id (FK) ────────────┤──>[d1,d2,d3,d4,d5]
│ software                 │
│ total_purchased          │
│ used                     │
│ cost_per_license         │
│ created_at               │
│ updated_at               │
└──────────────────────────┘
```

---

## 📊 Table Relationships

### Department → Users (1:N)
- 1 Department has many Users
- Cascade: No (SET NULL on delete)
- A user is assigned to 1 department (or NULL if admin)

### Department → Expenses (1:N)
- 1 Department has many Expenses
- Cascade: YES (ON DELETE CASCADE)
- All expenses for a department are deleted if department is deleted

### Department → Licenses (1:N)
- 1 Department has many Licenses
- Cascade: YES (ON DELETE CASCADE)
- All licenses for a department are deleted if department is deleted

---

## 📈 Query Examples for Backend Integration

### Get all expenses for a specific department (current month)
```sql
SELECT * FROM expenses 
WHERE dept_id = 'd1' 
AND month = DATE_FORMAT(NOW(), '%Y-%m')
ORDER BY created_at DESC;
```

### Calculate total spending per department per month
```sql
SELECT 
    d.id,
    d.name,
    e.month,
    SUM(e.amount) as total_spent,
    (d.budget / 12) as monthly_allocation
FROM departments d
LEFT JOIN expenses e ON d.id = e.dept_id
GROUP BY d.id, d.name, e.month
ORDER BY e.month DESC, d.name ASC;
```

### Get license utilization report
```sql
SELECT 
    l.id,
    l.software,
    d.name as department,
    l.total_purchased,
    l.used,
    ROUND((l.used / l.total_purchased) * 100, 2) as utilization_percent,
    (l.total_purchased - l.used) as available
FROM licenses l
JOIN departments d ON l.dept_id = d.id
ORDER BY utilization_percent DESC;
```

### Get expense breakdown by category for all departments
```sql
SELECT 
    category,
    COUNT(*) as expense_count,
    SUM(amount) as total_amount,
    AVG(amount) as avg_amount,
    MIN(amount) as min_amount,
    MAX(amount) as max_amount
FROM expenses
GROUP BY category
ORDER BY total_amount DESC;
```

### User authentication query
```sql
SELECT * FROM users 
WHERE username = 'admin' 
AND password = 'admin123'
AND is_active = TRUE;
```

### Get monthly expense trend per department
```sql
SELECT 
    d.name,
    e.month,
    e.category,
    SUM(e.amount) as amount,
    COUNT(*) as expense_count
FROM departments d
LEFT JOIN expenses e ON d.id = e.dept_id
GROUP BY d.id, d.name, e.month, e.category
ORDER BY d.name, e.month DESC;
```

### Budget vs Actual comparison
```sql
SELECT 
    d.id,
    d.name,
    d.budget,
    SUM(e.amount) as total_spent,
    (d.budget - SUM(e.amount)) as remaining,
    ROUND((SUM(e.amount) / d.budget) * 100, 2) as percent_spent
FROM departments d
LEFT JOIN expenses e ON d.id = e.dept_id
GROUP BY d.id, d.name, d.budget
ORDER BY percent_spent DESC;
```

---

## 🔍 Important Indexes

The schema includes performance-optimized indexes:

| Table | Indexes | Purpose |
|-------|---------|---------|
| departments | idx_name | Fast lookup by department name |
| users | idx_username | Fast login lookup |
| | idx_role | Filter users by role |
| | idx_dept_id | Find users by department |
| expenses | idx_dept_id | Find expenses by department |
| | idx_category | Filter by expense category |
| | idx_month | Find expenses by month |
| | idx_dept_month | Combined filter (dept + month) |
| licenses | idx_dept_id | Find licenses by department |
| | idx_software | Search by software name |

---

## 🛡️ Data Integrity Rules

### Constraints Applied:
1. **PRIMARY KEYS** - Ensure unique identification
2. **FOREIGN KEYS** - Maintain referential integrity
3. **UNIQUE CONSTRAINTS** - username and department name are unique
4. **NOT NULL** - Critical fields are protected
5. **ENUM FIELDS** - Role and category are restricted to valid values
6. **CHECK CONSTRAINTS** (via ENUM) - ensure valid data

### Cascading Delete Rules:
- Users: SET NULL (admin can delete without losing expense records)
- Expenses: CASCADE DELETE (if dept deleted, all expenses deleted)
- Licenses: CASCADE DELETE (if dept deleted, all licenses deleted)

---

## 📅 Data Expiration & Archiving Strategy

### Recommended Practices:
1. **Keep active expenses** (last 24 months)
2. **Archive old expenses** to expense_archive table quarterly
3. **Monthly data snapshots** for reporting
4. **Soft deletes** using is_active or status column

### Sample Archive Query:
```sql
-- Create archive table
CREATE TABLE expenses_archive LIKE expenses;

-- Move old data
INSERT INTO expenses_archive 
SELECT * FROM expenses 
WHERE month < DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 24 MONTH), '%Y-%m');

-- Delete from main table
DELETE FROM expenses 
WHERE month < DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 24 MONTH), '%Y-%m');
```

---

## 🚀 Scaling Considerations

### When to Optimize:
- **Partitioning:** Partition expenses by month when > 1M records
- **Archiving:** Move expenses older than 2 years
- **Connection Pooling:** Use pool size 10-20 for backend
- **Read Replicas:** Add read-only replicas for reporting
- **Caching Layer:** Cache department budgets (updates weekly)

### Expected Growth:
- **Expenses:** ~100-500 per month (scale ~30K-150K annually)
- **Licenses:** ~50-100 total (~1-2% growth monthly)
- **Users:** ~50-200 total (static-slow growth)
- **Departments:** ~5-50 total (static)

---

## 🔐 Security Checklist

- [ ] Hash all passwords (bcrypt minimum)
- [ ] Use HTTPS for all API calls
- [ ] Implement SQL injection prevention (prepared statements)
- [ ] Add row-level security for multi-tenant access
- [ ] Audit log all delete/update operations
- [ ] Enable MySQL audit plugin
- [ ] Regular backups (daily minimum)
- [ ] Test disaster recovery quarterly
- [ ] Use environment variables for DB credentials
- [ ] Implement rate limiting on API

---

## 📞 Common Issues & Solutions

### Issue: Users can see all departments data
**Solution:** Implement row-level security in your backend:
```javascript
// Only show own department's data
if (user.role === 'department') {
    query.where('dept_id', user.dept_id);
}
```

### Issue: Performance degradation with large expense tables
**Solution:** Add composite index & pagination:
```sql
CREATE INDEX idx_dept_month_category ON expenses(dept_id, month, category);
-- Use LIMIT & OFFSET in queries
```

### Issue: Password field too small
**Solution:** Increase to VARCHAR(255) for hashed passwords

### Issue: Month format inconsistency
**Solution:** Enforce YYYY-MM format in application layer & database

---

## 📋 Maintenance Scripts

### Weekly Backup:
```sql
-- Export all data
mysqldump -u root -p it_budget_buddy > backup_$(date +%Y%m%d).sql
```

### Check Data Integrity:
```sql
-- Verify all expenses have valid departments
SELECT e.* FROM expenses e
LEFT JOIN departments d ON e.dept_id = d.id
WHERE d.id IS NULL;

-- Verify all users have valid departments (if assigned)
SELECT u.* FROM users u
LEFT JOIN departments d ON u.dept_id = d.id
WHERE u.dept_id IS NOT NULL AND d.id IS NULL;
```

### Generate Summary Report:
```sql
SELECT 
    'Total Departments' as metric, COUNT(*) as value FROM departments
UNION ALL
SELECT 'Total Users', COUNT(*) FROM users
UNION ALL
SELECT 'Total Expenses', COUNT(*) FROM expenses
UNION ALL
SELECT 'Total Licenses', COUNT(*) FROM licenses
UNION ALL
SELECT 'Total Expense Amount', SUM(amount) FROM expenses;
```

---

**Database reference complete! 📚**
