# IT Budget Buddy – Migration & New Features

## Database migration (MySQL)

Run the migration script against your existing database to add new tables and columns. Use **MySQL-compatible syntax only**. If a column or table already exists, skip that statement or run sections individually to avoid duplicate errors.

1. **Run the migration**
   - Open `SCHEMA_MIGRATION_V2.sql` in your MySQL client or run:
   - `mysql -u root -p it_budget_buddy < SCHEMA_MIGRATION_V2.sql`
   - If you get "Duplicate column" or "Duplicate key" errors, comment out the corresponding lines and re-run.

2. **New tables**
   - `budgets` – yearly allocated amount per department (department_id, year, allocated_amount).
   - `vendors` – vendor name, contact_email, annual_contract_value, contract_start_date, contract_end_date.
   - `software_licenses` – department_id, vendor_id, software_name, purchase_date, expiry_date, renewal_cost.
   - `forecasts` – department_id, forecast_type (monthly/yearly), predicted_value.
   - `optimization_logs` – department_id, suggestion_text.
   - `audit_logs` – user_id, action, timestamp.

3. **Altered tables**
   - `users`: optional `email`, `password_hash` (keep existing `password` for legacy; app supports both).
   - `departments`: optional `description`.
   - `expenses`: optional `year`, `vendor_id`, `created_at` (and `category_id` if not already from a previous migration).

## Backend (Flask)

- **JWT auth** – Login returns a JWT; frontend stores it and sends `Authorization: Bearer <token>` on API calls.
- **Password hashing** – New users get bcrypt-hashed passwords in `password_hash` when the column exists; login accepts either hashed or legacy plain password.
- **New endpoints**
  - **Budgets**: `GET/POST /budgets` (filter by department_id, year).
  - **Vendors**: `GET/POST /vendors`, `PUT/DELETE /vendors/<id>`.
  - **Software licenses**: `GET/POST /software-licenses`, `PUT /software-licenses/<id>`.
  - **Forecasts**: `GET /forecasts`, `POST /forecasts/generate` (scikit-learn linear regression on monthly spending).
  - **Optimization**: `GET /optimization`, `POST /optimization/generate` (rule-based suggestions stored in `optimization_logs`).
  - **Alerts**: `GET /alerts/licenses-expiring` (expiry within 30 days), `GET /alerts/vendors-expiring` (contract end within 60 days).
- **Dashboards**
  - **Admin**: total allocated, total spent, remaining, utilization %, variance, department breakdown, category breakdown, monthly trends, forecast next month/year per department, license expiry (30d), vendor contract expiry (60d), optimization suggestions.
  - **Department**: allocated budget (from `budgets` for current year or `departments.budget`), total spending, remaining, utilization %, category breakdown, monthly trends.

## Frontend

- **Auth** – Token from login is stored in `localStorage` and sent in `Authorization` header by `api.ts`.
- **Admin**
  - **Dashboard**: Uses `/dashboard/admin` for metrics, variance, forecasts, license/vendor alerts, optimization list; "Generate" buttons for forecasts and optimization.
  - **Vendors**: New "Vendors" page (nav) – CRUD for vendors (name, contact email, annual value, contract dates).
  - **Forecasting**: "Generate forecasts" calls `/forecasts/generate` and shows next month / next year per department.
  - **Optimization**: "Generate suggestions" calls `/optimization/generate` and shows stored suggestions; still shows license-based suggestions when no API suggestions exist.
- **Department**
  - Dashboard and expense recording unchanged; totals/remaining/utilization are computed from API or local state.
  - Forecasting and Optimization pages use the same APIs (filtered by department for dept users where applicable).

## Financial metrics (computed only)

- **Total spending** = SUM(expenses.amount) per department per year.
- **Remaining budget** = Allocated budget − Total spending.
- **Utilization %** = (Total spending / Allocated budget) × 100.
- **Variance** = Allocated − Actual.

These are never manually entered; they are derived from `budgets` and `expenses`.

## Optimization rules (backend)

- If forecasted next year spending > allocation by >15% → suggest increasing allocation.
- If forecasted next year spending < allocation by >15% → suggest reducing allocation.
- If utilization &lt; 70% for two consecutive years → suggest reallocating surplus.
- If utilization ≥ 100% → suggest increasing base allocation.
- If annual growth rate &gt; 20% → recommend higher future allocation.

Suggestions are stored in `optimization_logs` and shown on the Admin dashboard and Optimization page.

## Running the app

1. **Backend**
   - `cd backend`
   - `pip install -r requirements.txt` (includes PyJWT, bcrypt, scikit-learn).
   - Set env if needed: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`.
   - `python app.py` (runs on port 5000).

2. **Frontend**
   - `cd frontend && npm install && npm run dev`.

3. **First login**
   - Use existing users; new users get hashed passwords if `password_hash` column exists.
   - After migration, run "Generate" for forecasts and optimization at least once to populate data for the Admin dashboard.
