-- IT Budget Buddy: Base schema bootstrap for Railway
-- Run this first on a fresh Railway MySQL database.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS departments (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    budget DECIMAL(15,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_departments_name (name)
);

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    password VARCHAR(255) NULL,
    password_hash VARCHAR(255) NULL,
    display_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'department',
    dept_id VARCHAR(50) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_users_username (username),
    INDEX idx_users_dept_id (dept_id)
);

CREATE TABLE IF NOT EXISTS expense_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    color_code VARCHAR(7),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT IGNORE INTO expense_categories (id, name, description, color_code) VALUES
(1, 'IT Personnel Costs', 'Salaries and wages for IT staff', '#8B5CF6'),
(2, 'Hardware Expenditures', 'Computers, servers, and hardware purchases', '#3B82F6'),
(3, 'Software Licensing', 'Software licenses, subscriptions, and SaaS fees', '#10B981'),
(4, 'Infrastructure & Maintenance', 'Network infrastructure, server maintenance, and support', '#F59E0B'),
(5, 'Outsourcing', 'Outsourced IT services and vendor contracts', '#EF4444'),
(6, 'Disaster Recovery', 'Backup solutions, DR planning, and business continuity', '#8B5CF6'),
(7, 'Training & Development', 'Employee training, certifications, and development programs', '#06B6D4');

CREATE TABLE IF NOT EXISTS expenses (
    id VARCHAR(50) PRIMARY KEY,
    dept_id VARCHAR(50) NOT NULL,
    category VARCHAR(100) NULL,
    category_id INT NULL,
    vendor_id INT NULL,
    amount DECIMAL(15,2) NOT NULL,
    month VARCHAR(7) NOT NULL,
    year INT NULL,
    description TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_expenses_dept_id (dept_id),
    INDEX idx_expenses_month (month),
    INDEX idx_expenses_year (year),
    INDEX idx_expenses_category_id (category_id)
);

CREATE TABLE IF NOT EXISTS licenses (
    id VARCHAR(50) PRIMARY KEY,
    dept_id VARCHAR(50) NOT NULL,
    software VARCHAR(255) NOT NULL,
    total_purchased INT NOT NULL DEFAULT 0,
    used INT NOT NULL DEFAULT 0,
    cost_per_license DECIMAL(15,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_licenses_dept_id (dept_id)
);

SET FOREIGN_KEY_CHECKS = 1;

SELECT 'Bootstrap schema applied' AS status;
