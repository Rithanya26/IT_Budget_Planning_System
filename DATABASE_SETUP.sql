-- ====================================================
-- IT-BUDGET-BUDDY Database Schema
-- Create this database in MySQL Workbench
-- ====================================================

-- Create Database
CREATE DATABASE IF NOT EXISTS it_budget_buddy;
USE it_budget_buddy;

-- ====================================================
-- TABLE 1: DEPARTMENTS
-- ====================================================
CREATE TABLE IF NOT EXISTS departments (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    budget DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
);

-- ====================================================
-- TABLE 2: USERS
-- ====================================================
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'department') NOT NULL,
    dept_id VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (dept_id) REFERENCES departments(id) ON DELETE SET NULL,
    INDEX idx_username (username),
    INDEX idx_role (role),
    INDEX idx_dept_id (dept_id)
);

-- ====================================================
-- TABLE 3: EXPENSES
-- ====================================================
CREATE TABLE IF NOT EXISTS expenses (
    id VARCHAR(50) PRIMARY KEY,
    dept_id VARCHAR(50) NOT NULL,
    category ENUM('Cloud', 'Software Licenses', 'Hardware', 'Maintenance') NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (dept_id) REFERENCES departments(id) ON DELETE CASCADE,
    INDEX idx_dept_id (dept_id),
    INDEX idx_category (category),
    INDEX idx_month (month),
    INDEX idx_dept_month (dept_id, month)
);

-- ====================================================
-- TABLE 4: LICENSES
-- ====================================================
CREATE TABLE IF NOT EXISTS licenses (
    id VARCHAR(50) PRIMARY KEY,
    dept_id VARCHAR(50) NOT NULL,
    software VARCHAR(100) NOT NULL,
    total_purchased INT NOT NULL,
    used INT NOT NULL,
    cost_per_license DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (dept_id) REFERENCES departments(id) ON DELETE CASCADE,
    INDEX idx_dept_id (dept_id),
    INDEX idx_software (software)
);

-- ====================================================
-- INSERT INITIAL DATA
-- ====================================================

-- Insert Departments
INSERT INTO departments (id, name, budget) VALUES
('d1', 'HR', 50000),
('d2', 'Cloud Infrastructure', 120000),
('d3', 'Software Development', 90000),
('d4', 'Finance', 40000),
('d5', 'Security', 70000);

-- Insert Users
INSERT INTO users (id, username, password, display_name, role, dept_id) VALUES
('u1', 'admin', 'admin123', 'IT Manager', 'admin', NULL),
('u2', 'hr_user', 'pass123', 'HR Lead', 'department', 'd1'),
('u3', 'cloud_user', 'pass123', 'Cloud Engineer', 'department', 'd2'),
('u4', 'dev_user', 'pass123', 'Dev Lead', 'department', 'd3'),
('u5', 'finance_user', 'pass123', 'Finance Analyst', 'department', 'd4'),
('u6', 'security_user', 'pass123', 'Security Lead', 'department', 'd5');

-- Insert Expenses (HR Department)
INSERT INTO expenses (id, dept_id, category, amount, month, description) VALUES
('e1', 'd1', 'Software Licenses', 3200, '2025-04', 'HR Management Suite'),
('e2', 'd1', 'Hardware', 5500, '2025-05', 'Laptops for new hires'),
('e3', 'd1', 'Software Licenses', 3200, '2025-06', 'HR Management Suite renewal'),
('e4', 'd1', 'Maintenance', 1800, '2025-07', 'System maintenance'),
('e5', 'd1', 'Software Licenses', 3200, '2025-08', 'HR Suite Q3'),
('e6', 'd1', 'Hardware', 2400, '2025-09', 'Monitors');

-- Insert Expenses (Cloud Infrastructure)
INSERT INTO expenses (id, dept_id, category, amount, month, description) VALUES
('e7', 'd2', 'Cloud', 18000, '2025-04', 'AWS monthly'),
('e8', 'd2', 'Cloud', 19500, '2025-05', 'AWS monthly + scaling'),
('e9', 'd2', 'Cloud', 21000, '2025-06', 'AWS monthly + new services'),
('e10', 'd2', 'Cloud', 20000, '2025-07', 'AWS monthly'),
('e11', 'd2', 'Maintenance', 3500, '2025-08', 'Infrastructure maintenance'),
('e12', 'd2', 'Cloud', 22000, '2025-09', 'AWS + Azure expansion');

-- Insert Expenses (Software Development)
INSERT INTO expenses (id, dept_id, category, amount, month, description) VALUES
('e13', 'd3', 'Software Licenses', 5000, '2025-04', 'JetBrains licenses'),
('e14', 'd3', 'Cloud', 8000, '2025-05', 'Dev environment hosting'),
('e15', 'd3', 'Hardware', 12000, '2025-06', 'Developer workstations'),
('e16', 'd3', 'Software Licenses', 5000, '2025-07', 'JetBrains renewal'),
('e17', 'd3', 'Cloud', 8500, '2025-08', 'Staging servers'),
('e18', 'd3', 'Maintenance', 3000, '2025-09', 'CI/CD maintenance');

-- Insert Expenses (Finance)
INSERT INTO expenses (id, dept_id, category, amount, month, description) VALUES
('e19', 'd4', 'Software Licenses', 4500, '2025-04', 'SAP license'),
('e20', 'd4', 'Software Licenses', 4500, '2025-06', 'SAP renewal'),
('e21', 'd4', 'Hardware', 3000, '2025-07', 'Secure workstations'),
('e22', 'd4', 'Maintenance', 1500, '2025-08', 'Audit system maintenance'),
('e23', 'd4', 'Software Licenses', 4500, '2025-09', 'SAP Q3');

-- Insert Expenses (Security)
INSERT INTO expenses (id, dept_id, category, amount, month, description) VALUES
('e24', 'd5', 'Software Licenses', 8000, '2025-04', 'CrowdStrike licenses'),
('e25', 'd5', 'Cloud', 5000, '2025-05', 'SIEM cloud hosting'),
('e26', 'd5', 'Hardware', 6000, '2025-06', 'Firewall appliances'),
('e27', 'd5', 'Software Licenses', 8000, '2025-07', 'CrowdStrike renewal'),
('e28', 'd5', 'Cloud', 5500, '2025-08', 'SIEM scaling'),
('e29', 'd5', 'Maintenance', 4000, '2025-09', 'Security audit tools');

-- Insert Licenses
INSERT INTO licenses (id, dept_id, software, total_purchased, used, cost_per_license) VALUES
('l1', 'd1', 'HR Management Suite', 50, 35, 64),
('l2', 'd2', 'Datadog Monitoring', 20, 12, 150),
('l3', 'd3', 'JetBrains All Products', 30, 22, 167),
('l4', 'd3', 'GitHub Enterprise', 40, 38, 21),
('l5', 'd4', 'SAP ERP', 15, 8, 300),
('l6', 'd5', 'CrowdStrike Falcon', 100, 72, 80),
('l7', 'd5', 'Splunk Enterprise', 10, 4, 500);

-- ====================================================
-- VERIFICATION QUERIES
-- ====================================================

-- View all tables
SELECT * FROM departments;
SELECT * FROM users;
SELECT * FROM expenses;
SELECT * FROM licenses;

-- View row counts
SELECT 'departments' as table_name, COUNT(*) as row_count FROM departments
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'expenses', COUNT(*) FROM expenses
UNION ALL
SELECT 'licenses', COUNT(*) FROM licenses;
