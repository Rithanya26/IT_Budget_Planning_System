@echo off
REM IT Budget Buddy - Database Migration Setup Script
REM This script applies the expense categories migration to your MySQL database

setlocal enabledelayedexpansion

echo.
echo ================================================
echo IT Budget Buddy - Category Migration Setup
echo ================================================
echo.

REM Configuration
set DB_HOST=localhost
set DB_USER=root
set DB_PASSWORD=Rithanya2026
set DB_NAME=it_budget_buddy
set MIGRATION_FILE=DATABASE_MIGRATION.sql

REM Check if MySQL is installed
where mysql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: MySQL is not installed or not in PATH
    echo Please install MySQL or add it to your system PATH
    echo.
    pause
    exit /b 1
)

echo Checking MySQL connection...
mysql -h %DB_HOST% -u %DB_USER% -p%DB_PASSWORD% -e "SELECT 1" >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Could not connect to MySQL
    echo Please check your credentials:
    echo   Host: %DB_HOST%
    echo   User: %DB_USER%
    echo   Database: %DB_NAME%
    echo.
    pause
    exit /b 1
)

echo Connected successfully!
echo.
echo Applying migration script: %MIGRATION_FILE%
echo.

REM Apply the migration
mysql -h %DB_HOST% -u %DB_USER% -p%DB_PASSWORD% %DB_NAME% < %MIGRATION_FILE%

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ================================================
    echo SUCCESS: Database migration completed!
    echo ================================================
    echo.
    echo The following changes were applied:
    echo - Created expense_categories table
    echo - Inserted 7 predefined IT budget categories
    echo - Added category_id column to expenses table
    echo - Created expenses_with_categories view
    echo.
    echo Next steps:
    echo 1. Restart your backend server (python app.py)
    echo 2. Refresh your browser to see the changes
    echo 3. Test adding an expense with the new categories
    echo.
) else (
    echo.
    echo ================================================
    echo ERROR: Migration failed
    echo ================================================
    echo.
    echo Please check:
    echo 1. MySQL credentials are correct
    echo 2. Database 'it_budget_buddy' exists
    echo 3. Migration file 'DATABASE_MIGRATION.sql' is in the correct directory
    echo.
)

pause
