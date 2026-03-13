-- IT Budget Buddy Database Migration
-- Add Expense Categories Support

-- Step 1: Create expense_categories table
CREATE TABLE IF NOT EXISTS expense_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    color_code VARCHAR(7),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Step 2: Insert predefined IT budget categories
INSERT IGNORE INTO expense_categories (name, description, color_code) VALUES
('IT Personnel Costs', 'Salaries and wages for IT staff', '#8B5CF6'),
('Hardware Expenditures', 'Computers, servers, and hardware purchases', '#3B82F6'),
('Software Licensing', 'Software licenses, subscriptions, and SaaS fees', '#10B981'),
('Infrastructure & Maintenance', 'Network infrastructure, server maintenance, and support', '#F59E0B'),
('Outsourcing', 'Outsourced IT services and vendor contracts', '#EF4444'),
('Disaster Recovery', 'Backup solutions, DR planning, and business continuity', '#8B5CF6'),
('Training & Development', 'Employee training, certifications, and development programs', '#06B6D4');

-- -- Step 3: Add category_id column (Run this only ONCE)
-- ALTER TABLE expenses 
-- ADD COLUMN category_id INT NULL;

-- Step 4: Add foreign key (Run only if not already added)
ALTER TABLE expenses 
ADD CONSTRAINT fk_expenses_category 
FOREIGN KEY (category_id) 
REFERENCES expense_categories(id) 
ON DELETE SET NULL;

-- Step 5: Drop view if exists (for older MySQL compatibility)
DROP VIEW IF EXISTS expenses_with_categories;

-- Step 6: Create view
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

-- Verify
SELECT 'Expense Categories Created Successfully' AS status;
SELECT COUNT(*) AS total_categories FROM expense_categories;