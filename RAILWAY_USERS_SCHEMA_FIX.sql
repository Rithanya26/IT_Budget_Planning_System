-- Fix missing users columns in Railway MySQL
-- Run this in Railway SQL editor

ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name VARCHAR(255) NULL AFTER username;
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) NOT NULL DEFAULT 'department' AFTER display_name;
ALTER TABLE users ADD COLUMN IF NOT EXISTS dept_id VARCHAR(50) NULL AFTER role;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE AFTER dept_id;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) NULL AFTER password;

-- Backfill display_name for existing records
UPDATE users
SET display_name = username
WHERE display_name IS NULL OR display_name = '';

-- Optional index/constraint improvements
ALTER TABLE users ADD UNIQUE INDEX IF NOT EXISTS uk_users_username (username);

SELECT 'users schema fix applied' AS status;
