-- CRITICAL FIX: Expense Categories Schema Update
-- This script fixes the database schema to properly support the new 7 IT budget categories

SET FOREIGN_KEY_CHECKS = 0;

-- Step 1: Create expense_categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS expense_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    color_code VARCHAR(7),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Step 2: Drop existing foreign key constraints if they exist
ALTER TABLE expenses DROP FOREIGN KEY IF EXISTS fk_expenses_category_id;
ALTER TABLE expenses DROP FOREIGN KEY IF EXISTS fk_expenses_category;

-- Step 3: Insert/Update the 7 IT budget categories (don't truncate)
DELETE FROM expense_categories WHERE name IN (
    'IT Personnel Costs',
    'Hardware Expenditures', 
    'Software Licensing',
    'Infrastructure & Maintenance',
    'Outsourcing',
    'Disaster Recovery',
    'Training & Development'
);

INSERT INTO expense_categories (name, description, color_code) VALUES
('IT Personnel Costs', 'Salaries and wages for IT staff', '#8B5CF6'),
('Hardware Expenditures', 'Computers, servers, and hardware purchases', '#3B82F6'),
('Software Licensing', 'Software licenses, subscriptions, and SaaS fees', '#10B981'),
('Infrastructure & Maintenance', 'Network infrastructure, server maintenance, and support', '#F59E0B'),
('Outsourcing', 'Outsourced IT services and vendor contracts', '#EF4444'),
('Disaster Recovery', 'Backup solutions, DR planning, and business continuity', '#8B5CF6'),
('Training & Development', 'Employee training, certifications, and development programs', '#06B6D4');

-- Step 4: ADD MISSING COLUMNS TO EXPENSES TABLE
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS category_id INT;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS vendor_id INT;

-- Step 5: REMOVE THE OLD ENUM CONSTRAINT
-- Change the category column to VARCHAR to accept any category name
ALTER TABLE expenses MODIFY COLUMN category VARCHAR(100);

-- Step 6: Update category column to store category names from the enum values
UPDATE expenses SET category = 'Hardware Expenditures' WHERE category = 'Hardware';
UPDATE expenses SET category = 'Software Licensing' WHERE category = 'Software Licenses';
UPDATE expenses SET category = 'Infrastructure & Maintenance' WHERE category = 'Cloud';
UPDATE expenses SET category = 'Infrastructure & Maintenance' WHERE category = 'Maintenance';

-- Step 7: Populate category_id based on category name
UPDATE expenses e
JOIN expense_categories ec ON e.category = ec.name
SET e.category_id = ec.id
WHERE e.category_id IS NULL;

-- Step 8: Set default category_id for any rows without a match
UPDATE expenses 
SET category_id = 1, category = 'IT Personnel Costs'
WHERE category_id IS NULL;

-- Step 9: Add foreign key constraint
ALTER TABLE expenses 
ADD CONSTRAINT fk_expenses_category_id 
FOREIGN KEY (category_id) 
REFERENCES expense_categories(id) 
ON DELETE SET NULL;

-- Step 10: Create/Recreate view for easier querying
DROP VIEW IF EXISTS expenses_with_categories;

CREATE VIEW expenses_with_categories AS
SELECT 
    e.id,
    e.dept_id,
    e.category,
    ec.name AS category_name,
    e.amount,
    e.month,
    e.description,
    e.created_at,
    e.category_id
FROM expenses e
LEFT JOIN expense_categories ec ON e.category_id = ec.id;

SET FOREIGN_KEY_CHECKS = 1;

-- Verify the changes
SELECT 'Schema Fix Complete!' AS Status;
SELECT * FROM expense_categories;
