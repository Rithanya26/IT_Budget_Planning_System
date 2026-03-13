-- =============================================================================
-- IT Budget Buddy - Schema Migration V2
-- MySQL-compatible. Run against existing database.
-- If a column/table already exists, you may see duplicate errors; skip that
-- statement or run sections individually.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. USERS: add email, password_hash; ensure department_id
-- (If your table uses dept_id, add: department_id INT NULL after role, then
--  UPDATE users SET department_id = dept_id; then drop dept_id if desired.)
-- -----------------------------------------------------------------------------
-- Add email (unique) - run only if column does not exist
-- ALTER TABLE users ADD COLUMN email VARCHAR(255) NULL UNIQUE AFTER display_name;
-- Add password_hash - run only if column does not exist (rename from password)
-- ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) NULL AFTER password;
-- If you have plain 'password' column, add password_hash and migrate in app:
-- ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) NULL AFTER password;
-- Ensure department_id exists (some schemas use dept_id)
-- ALTER TABLE users ADD COLUMN department_id VARCHAR(50) NULL AFTER role;
-- Add index for department_id if present
-- CREATE INDEX idx_users_department_id ON users(department_id);

-- -----------------------------------------------------------------------------
-- 2. DEPARTMENTS: add description
-- -----------------------------------------------------------------------------
-- ALTER TABLE departments ADD COLUMN description VARCHAR(500) NULL AFTER name;

-- -----------------------------------------------------------------------------
-- 3. BUDGETS (new table) - yearly budget per department
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS budgets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    department_id VARCHAR(50) NOT NULL,
    year INT NOT NULL,
    allocated_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_budget_dept_year (department_id, year),
    INDEX idx_budgets_department_id (department_id),
    INDEX idx_budgets_year (year)
);
-- Optional: migrate existing department.budget into budgets for current year
-- INSERT INTO budgets (department_id, year, allocated_amount)
-- SELECT id, YEAR(CURDATE()), COALESCE(budget, 0) FROM departments
-- ON DUPLICATE KEY UPDATE allocated_amount = VALUES(allocated_amount);

-- -----------------------------------------------------------------------------
-- 4. EXPENSE_CATEGORIES (already in DATABASE_MIGRATION.sql)
-- -----------------------------------------------------------------------------
-- Ensure table exists (no-op if already created)
CREATE TABLE IF NOT EXISTS expense_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    color_code VARCHAR(7),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 5. VENDORS (new table)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vendors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    contact_email VARCHAR(255),
    annual_contract_value DECIMAL(15,2) NULL,
    contract_start_date DATE NULL,
    contract_end_date DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_vendors_contract_end (contract_end_date)
);

-- -----------------------------------------------------------------------------
-- 6. EXPENSES: add year, vendor_id, ensure category_id
-- -----------------------------------------------------------------------------
-- ALTER TABLE expenses ADD COLUMN year INT NULL AFTER month;
-- ALTER TABLE expenses ADD COLUMN vendor_id INT NULL AFTER category_id;
-- ALTER TABLE expenses ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
-- Update year from month if month is 'YYYY-MM'
-- UPDATE expenses SET year = CAST(SUBSTRING(month, 1, 4) AS UNSIGNED) WHERE year IS NULL AND month IS NOT NULL AND LENGTH(month) >= 4;
-- Indexes (skip statement if index already exists)
CREATE INDEX idx_expenses_department_year ON expenses(dept_id, year);
-- CREATE INDEX idx_expenses_category_id ON expenses(category_id);
-- CREATE INDEX idx_expenses_vendor_id ON expenses(vendor_id);
-- FK for vendor_id (run after vendors table exists; skip if constraint exists):
-- ALTER TABLE expenses ADD CONSTRAINT fk_expenses_vendor FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL;

-- -----------------------------------------------------------------------------
-- 7. SOFTWARE_LICENSES (new table - spec name)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS software_licenses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    department_id VARCHAR(50) NOT NULL,
    vendor_id INT NULL,
    software_name VARCHAR(200) NOT NULL,
    purchase_date DATE NULL,
    expiry_date DATE NULL,
    renewal_cost DECIMAL(15,2) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_software_licenses_department (department_id),
    INDEX idx_software_licenses_vendor (vendor_id),
    INDEX idx_software_licenses_expiry (expiry_date),
    CONSTRAINT fk_software_licenses_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
    CONSTRAINT fk_software_licenses_vendor FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL
);

-- -----------------------------------------------------------------------------
-- 8. FORECASTS (new table)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS forecasts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    department_id VARCHAR(50) NOT NULL,
    forecast_type ENUM('monthly','yearly') NOT NULL,
    predicted_value DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_forecasts_department (department_id),
    INDEX idx_forecasts_created (created_at)
);

-- -----------------------------------------------------------------------------
-- 9. OPTIMIZATION_LOGS (new table)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS optimization_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    department_id VARCHAR(50) NULL,
    suggestion_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_optimization_logs_department (department_id)
);

-- -----------------------------------------------------------------------------
-- 10. AUDIT_LOGS (new table)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(50) NULL,
    action VARCHAR(500) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_logs_user (user_id),
    INDEX idx_audit_logs_timestamp (timestamp)
);

-- End of migration
