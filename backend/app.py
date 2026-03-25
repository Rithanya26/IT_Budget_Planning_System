from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
from datetime import datetime, timedelta
import json
import os
from urllib.parse import urlparse

from auth_utils import (
    hash_password, check_password, create_token, decode_token,
    require_auth, require_admin, optional_auth
)
from forecast_service import predict_next_month, predict_next_year_budget, clean_data, calculate_accuracy
from optimization_service import generate_suggestions

app = Flask(__name__)
app.config['CORS_HEADERS'] = 'Content-Type'

# ✅ CORS configuration for Vercel frontend
CORS(app, resources={
    r"/*": {
        "origins": ["https://it-budget-planning-system.vercel.app"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

def _build_db_config():
    """Build DB config from DATABASE_URL, Railway vars, or DB_* vars."""
    database_url = os.environ.get("DATABASE_URL") or os.environ.get("MYSQL_URL")
    if database_url:
        parsed = urlparse(database_url)
        return {
            "host": parsed.hostname,
            "port": parsed.port or 3306,
            "user": parsed.username,
            "password": parsed.password,
            "database": (parsed.path or "").lstrip("/") or "railway",
        }, "DATABASE_URL/MYSQL_URL"

    # Railway public variable names (commonly provided by Railway)
    host = os.environ.get("MYSQLHOST") or os.environ.get("DB_HOST") or "centerbeam.proxy.rlwy.net"
    port = int(os.environ.get("MYSQLPORT") or os.environ.get("DB_PORT") or 24420)
    user = os.environ.get("MYSQLUSER") or os.environ.get("DB_USER") or "root"
    password = os.environ.get("MYSQLPASSWORD") or os.environ.get("DB_PASSWORD") or "EFJtobVOajQgDUUrtlGMUEsgDlSDrGBo"
    database = os.environ.get("MYSQLDATABASE") or os.environ.get("DB_NAME") or "railway"

    return {
        "host": host,
        "port": port,
        "user": user,
        "password": password,
        "database": database,
    }, "MYSQL*/DB_*"


DB_CONFIG, DB_CONFIG_SOURCE = _build_db_config()

def get_db_connection():
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        if connection.is_connected():
            return connection
    except Error as e:
        print("❌ DB Connection Error:", e)
        return None

def fetch_all_as_dict(cursor):
    """Convert query results to list of dictionaries"""
    columns = [desc[0] for desc in cursor.description]
    results = []
    for row in cursor.fetchall():
        results.append(dict(zip(columns, row)))
    return results

def fetch_one_as_dict(cursor, row):
    """Convert single row to dictionary"""
    if row is None:
        return None
    columns = [desc[0] for desc in cursor.description]
    return dict(zip(columns, row))


def _monthly_totals_from_expenses(cursor, dept_id):
    """Return ordered monthly totals for one department from live expenses data."""
    queries = [
        (
            "SELECT month, year, COALESCE(SUM(amount), 0) as total FROM expenses WHERE dept_id=%s GROUP BY year, month ORDER BY year, month",
            (dept_id,),
        ),
        (
            "SELECT month, COALESCE(SUM(amount), 0) as total FROM expenses WHERE dept_id=%s GROUP BY month ORDER BY month",
            (dept_id,),
        ),
        (
            "SELECT DATE_FORMAT(created_at, '%%Y-%%m') as month_key, COALESCE(SUM(amount), 0) as total FROM expenses WHERE dept_id=%s GROUP BY DATE_FORMAT(created_at, '%%Y-%%m') ORDER BY month_key",
            (dept_id,),
        ),
    ]

    for query, params in queries:
        try:
            cursor.execute(query, params)
            rows = cursor.fetchall()
            if not rows:
                return []
            cols = [d[0] for d in cursor.description] if cursor.description else []
            if "total" in cols:
                idx = cols.index("total")
                return [float(r[idx] or 0) for r in rows]
            return [float(r[-1] or 0) for r in rows]
        except Exception:
            continue

    return []


def _predict_for_department(cursor, dept_id):
    """Calculate latest forecasts for one department from live monthly totals."""
    monthly_totals = _monthly_totals_from_expenses(cursor, dept_id)
    monthly_totals = clean_data(monthly_totals)
    print(f"[forecast-debug] department={dept_id} monthly_totals={monthly_totals}")
   
    next_month_pred = float(predict_next_month(monthly_totals))
    next_year_pred = float(predict_next_year_budget(monthly_totals))
    actual, predicted, mape, accuracy = calculate_accuracy(monthly_totals)

    if actual is not None and predicted is not None and mape is not None and accuracy is not None:
        print(f"[forecast-metrics] department={dept_id}")
        print(f"Actual Expense    : {actual:.2f}")
        print(f"Predicted Expense : {predicted:.2f}")
        print(f"MAPE              : {mape:.2f}%")
        print(f"Accuracy          : {accuracy:.2f}%")
    else:
        print(f"[forecast-metrics] department={dept_id} insufficient data for MAPE/accuracy")

    return monthly_totals, next_month_pred, next_year_pred, actual, predicted, mape, accuracy
    # return monthly_totals, next_month_pred, next_year_pred
# def _predict_for_department(cursor, dept_id):
#     monthly_totals = _monthly_totals_from_expenses(cursor, dept_id)

#     print(f"[forecast-debug] department={dept_id} monthly_totals={monthly_totals}")

#     # Prediction
#     next_month_pred = float(predict_next_month(monthly_totals))
#     next_year_pred = float(predict_next_year_budget(monthly_totals))

#     # ✅ ADD EVALUATION HERE
#     def evaluate_model(data, test_size=2):
#         if len(data) <= test_size:
#             return None, None

#         train = data[:-test_size]
#         test = data[-test_size:]

#         a, b = _linear_regression(train)

#         predictions = []
#         for i in range(len(train), len(train) + test_size):
#             predictions.append(a + b * i)

#         n = len(test)
#         mse = sum((a - p) ** 2 for a, p in zip(test, predictions)) / n
#         rmse = mse ** 0.5

#         mean_actual = sum(test) / n
#         ss_total = sum((a - mean_actual) ** 2 for a in test)
#         ss_res = sum((a - p) ** 2 for a, p in zip(test, predictions))
#         r2 = 1 - (ss_res / ss_total) if ss_total != 0 else 0

#         return rmse, r2

#     rmse, r2 = evaluate_model(monthly_totals)

#     # ✅ PRINT ACCURACY IN TERMINAL
#     print(f"[forecast-result] department={dept_id}")
#     print(f"  Next Month Prediction: {next_month_pred:.2f}")
#     print(f"  Next Year Prediction : {next_year_pred:.2f}")

#     if rmse is not None:
#         print(f"  RMSE: {rmse:.2f}")
#         print(f"  R²  : {r2:.2f}")

#     return monthly_totals, next_month_pred, next_year_pred

@app.route("/")
def home():
    return jsonify({
        "message": "AI-Based IT Budget Planning, Forecasting & Optimization API",
        "endpoints": {
            "auth": "/login (POST) returns JWT + user",
            "departments": "/departments (GET, POST)",
            "users": "/users (GET, POST)",
            "categories": "/categories (GET)",
            "budgets": "/budgets (GET, POST)",
            "vendors": "/vendors (GET, POST), /vendors/<id> (PUT, DELETE)",
            "expenses": "/expenses (GET, POST), /expenses/<id> (GET, PUT, DELETE)",
            "licenses": "/licenses (GET, POST), /licenses/<id> (PUT)",
            "software_licenses": "/software-licenses (GET, POST), /software-licenses/<id> (PUT)",
            "forecasts": "/forecasts (GET), /forecasts/generate (POST), /forecasts/evaluate (GET)",
            "optimization": "/optimization (GET), /optimization/generate (POST)",
            "alerts": "/alerts/licenses-expiring (GET), /alerts/vendors-expiring (GET)",
            "dashboards": "/dashboard/department/<id> (GET), /dashboard/admin (GET)"
        }
    })

@app.route("/test-connection", methods=["GET"])
def test_connection():
    connection = get_db_connection()
    if connection and connection.is_connected():
        return jsonify({
            "status": "success",
            "message": "Connected to MySQL database successfully",
            "database": "it_budget_buddy"
        })
    else:
        return jsonify({
            "status": "failed",
            "message": "Failed to connect to MySQL database"
        }), 500

def _audit_log(conn, user_id: str, action: str):
    """Write to audit_logs if table exists."""
    try:
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO audit_logs (user_id, action) VALUES (%s, %s)",
            (user_id, action[:500])
        )
        conn.commit()
        cur.close()
    except Exception:
        pass


@app.route("/login", methods=["POST", "OPTIONS"])
def login():
    try:
        if request.method == "OPTIONS":
            return "", 200

        data = request.json
        username = (data.get("username") or "").strip()
        password = data.get("password") or ""
        if not username or not password:
            return jsonify({"status": "failed", "message": "Username and password required"}), 400
        connection = get_db_connection()
        if not connection:
            return jsonify({"status": "failed", "message": "Database connection error"}), 500
        cursor = connection.cursor()
        try:
            cursor.execute(
                "SELECT id, username, display_name, role, dept_id, password, password_hash FROM users WHERE username=%s AND is_active=TRUE",
                (username,),
            )
        except Exception:
            cursor.execute(
                "SELECT id, username, display_name, role, dept_id, password FROM users WHERE username=%s AND is_active=TRUE",
                (username,),
            )
        row = cursor.fetchone()
        if not row:
            cursor.close()
            connection.close()
            return jsonify({"status": "failed", "message": "Invalid credentials"}), 401
        columns = [desc[0] for desc in cursor.description]
        user_dict = dict(zip(columns, row))
        cursor.close()
        pw_ok = False
        if user_dict.get("password_hash"):
            pw_ok = check_password(password, user_dict["password_hash"])
        else:
            pw_ok = user_dict.get("password") == password
        if not pw_ok:
            connection.close()
            return jsonify({"status": "failed", "message": "Invalid credentials"}), 401
        for k in ("password", "password_hash"):
            user_dict.pop(k, None)
        token = create_token(
            user_dict["id"],
            user_dict.get("role", "department"),
            user_dict.get("dept_id"),
        )
        _audit_log(connection, user_dict["id"], "LOGIN")
        connection.close()
        return jsonify({"status": "success", "user": user_dict, "token": token}), 200
    except Exception as e:
        return jsonify({"status": "failed", "message": str(e)}), 500


@app.route("/departments", methods=["GET"])
def get_departments():
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({"status": "failed", "message": "Database connection error"}), 500
        
        cursor = connection.cursor()
        cursor.execute("SELECT id, name, budget, created_at, updated_at FROM departments ORDER BY name")
        departments = fetch_all_as_dict(cursor)
        cursor.close()
        connection.close()
        
        return jsonify({"status": "success", "departments": departments}), 200
    
    except Exception as e:
        return jsonify({"status": "failed", "message": str(e)}), 500


@app.route("/departments", methods=["POST"])
def create_department():
    try:
        data = request.json
        dept_id = data.get("id") or f"d{datetime.now().timestamp()}"
        name = data.get("name")
        budget = data.get("budget")
        
        if not name or not budget:
            return jsonify({"status": "failed", "message": "Name and budget required"}), 400
        
        connection = get_db_connection()
        if not connection:
            return jsonify({"status": "failed", "message": "Database connection error"}), 500
        
        cursor = connection.cursor()
        query = "INSERT INTO departments (id, name, budget) VALUES (%s, %s, %s)"
        cursor.execute(query, (dept_id, name, budget))
        connection.commit()
        cursor.close()
        connection.close()
        
        return jsonify({"status": "success", "message": "Department created", "id": dept_id}), 201
    
    except Exception as e:
        return jsonify({"status": "failed", "message": str(e)}), 500


@app.route("/users", methods=["GET"])
def get_users():
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({"status": "failed", "message": "Database connection error"}), 500
        
        cursor = connection.cursor()
        cursor.execute("SELECT id, username, display_name, role, dept_id, is_active FROM users ORDER BY display_name")
        users = fetch_all_as_dict(cursor)
        cursor.close()
        connection.close()
        
        return jsonify({"status": "success", "users": users}), 200
    
    except Exception as e:
        return jsonify({"status": "failed", "message": str(e)}), 500


@app.route("/users", methods=["POST"])
def create_user():
    try:
        data = request.json
        user_id = data.get("id") or f"u{datetime.now().timestamp()}"
        username = (data.get("username") or "").strip()
        password = data.get("password") or ""
        display_name = (data.get("display_name") or "").strip()
        role = data.get("role", "department")
        dept_id = data.get("dept_id")
        if not all([username, password, display_name]):
            return jsonify({"status": "failed", "message": "Username, password, and display_name required"}), 400
        connection = get_db_connection()
        if not connection:
            return jsonify({"status": "failed", "message": "Database connection error"}), 500
        cursor = connection.cursor()
        pw_hash = hash_password(password)
        try:
            cursor.execute(
                "INSERT INTO users (id, username, password_hash, display_name, role, dept_id) VALUES (%s, %s, %s, %s, %s, %s)",
                (user_id, username, pw_hash, display_name, role, dept_id),
            )
        except Exception:
            cursor.execute(
                "INSERT INTO users (id, username, password, display_name, role, dept_id) VALUES (%s, %s, %s, %s, %s, %s)",
                (user_id, username, password, display_name, role, dept_id),
            )
        connection.commit()
        cursor.close()
        connection.close()
        return jsonify({"status": "success", "message": "User created", "id": user_id}), 201
    except Exception as e:
        return jsonify({"status": "failed", "message": str(e)}), 500


# ==================== EXPENSE CATEGORIES ====================
@app.route("/categories", methods=["GET"])
def get_categories():
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({"status": "failed", "message": "Database connection error"}), 500
        
        cursor = connection.cursor()
        # Try to get from expense_categories table
        try:
            cursor.execute("SELECT id, name, description, color_code FROM expense_categories ORDER BY id")
            categories = fetch_all_as_dict(cursor)
        except:
            # Fallback if table doesn't exist - return hardcoded categories
            categories = [
                {"id": 1, "name": "IT Personnel Costs", "description": "Salaries and wages for IT staff", "color_code": "#8B5CF6"},
                {"id": 2, "name": "Hardware Expenditures", "description": "Computers, servers, and hardware purchases", "color_code": "#3B82F6"},
                {"id": 3, "name": "Software Licensing", "description": "Software licenses, subscriptions, and SaaS fees", "color_code": "#10B981"},
                {"id": 4, "name": "Infrastructure & Maintenance", "description": "Network infrastructure, server maintenance, and support", "color_code": "#F59E0B"},
                {"id": 5, "name": "Outsourcing", "description": "Outsourced IT services and vendor contracts", "color_code": "#EF4444"},
                {"id": 6, "name": "Disaster Recovery", "description": "Backup solutions, DR planning, and business continuity", "color_code": "#8B5CF6"},
                {"id": 7, "name": "Training & Development", "description": "Employee training, certifications, and development programs", "color_code": "#06B6D4"}
            ]
        
        cursor.close()
        connection.close()
        
        return jsonify({"status": "success", "categories": categories}), 200
    
    except Exception as e:
        return jsonify({"status": "failed", "message": str(e)}), 500


@app.route("/expenses", methods=["GET"])
def get_expenses():
    try:
        dept_id = request.args.get("dept_id")
        connection = get_db_connection()
        if not connection:
            return jsonify({"status": "failed", "message": "Database connection error"}), 500
        
        cursor = connection.cursor()
        if dept_id:
            query = "SELECT id, dept_id, category, amount, month, description, created_at FROM expenses WHERE dept_id=%s ORDER BY month DESC"
            cursor.execute(query, (dept_id,))
        else:
            query = "SELECT id, dept_id, category, amount, month, description, created_at FROM expenses ORDER BY month DESC"
            cursor.execute(query)
        
        expenses = fetch_all_as_dict(cursor)
        cursor.close()
        connection.close()
        
        return jsonify({"status": "success", "expenses": expenses}), 200
    
    except Exception as e:
        return jsonify({"status": "failed", "message": str(e)}), 500

@app.route("/expenses/<expense_id>", methods=["GET"])
def get_expense(expense_id):
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({"status": "failed", "message": "Database connection error"}), 500
        
        cursor = connection.cursor()
        query = "SELECT id, dept_id, category, amount, month, description, created_at FROM expenses WHERE id=%s"
        cursor.execute(query, (expense_id,))
        expense = cursor.fetchone()
        if expense:
            columns = [desc[0] for desc in cursor.description]
            expense_dict = dict(zip(columns, expense))
            cursor.close()
            connection.close()
            return jsonify({"status": "success", "expense": expense_dict}), 200
        else:
            cursor.close()
            connection.close()
            return jsonify({"status": "failed", "message": "Expense not found"}), 404
    
    except Exception as e:
        return jsonify({"status": "failed", "message": str(e)}), 500

@app.route("/expenses", methods=["POST"])
def create_expense():
    try:
        data = request.json
        expense_id = data.get("id") or f"e{datetime.now().timestamp()}"
        dept_id = data.get("dept_id")
        category = data.get("category")
        category_id = data.get("category_id")
        vendor_id = data.get("vendor_id")
        amount = float(data.get("amount", 0))
        month = data.get("month")
        description = data.get("description") or ""
        year = data.get("year")
        if month and len(month) >= 4 and not year:
            try:
                year = int(str(month)[:4])
            except Exception:
                year = datetime.now().year
        if not year:
            year = datetime.now().year
        if not all([dept_id, amount, month]):
            return jsonify({"status": "failed", "message": "dept_id, amount, and month required"}), 400
        connection = get_db_connection()
        if not connection:
            return jsonify({"status": "failed", "message": "Database connection error"}), 500
        cursor = connection.cursor()
        try:
            cursor.execute(
                "INSERT INTO expenses (id, dept_id, category, category_id, vendor_id, amount, month, year, description) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)",
                (expense_id, dept_id, category or None, category_id or None, vendor_id or None, amount, month, year, description),
            )
        except Exception as e1:
            # Fallback: try with year but without category_id and vendor_id
            try:
                cursor.execute(
                    "INSERT INTO expenses (id, dept_id, category, amount, month, year, description) VALUES (%s, %s, %s, %s, %s, %s, %s)",
                    (expense_id, dept_id, category or "", amount, month, year, description),
                )
            except Exception as e2:
                # Final fallback: minimal columns
                cursor.execute(
                    "INSERT INTO expenses (id, dept_id, category, amount, month, description) VALUES (%s, %s, %s, %s, %s, %s)",
                    (expense_id, dept_id, category or "", amount, month, description),
                )
        connection.commit()
        cursor.close()
        connection.close()
        return jsonify({"status": "success", "message": "Expense created", "id": expense_id}), 201
    except Exception as e:
        return jsonify({"status": "failed", "message": str(e)}), 500

@app.route("/expenses/<expense_id>", methods=["PUT"])
def update_expense(expense_id):
    try:
        data = request.json
        connection = get_db_connection()
        if not connection:
            return jsonify({"status": "failed", "message": "Database connection error"}), 500
        
        updates = []
        values = []
        for key in ['category', 'amount', 'month', 'description']:
            if key in data:
                updates.append(f"{key}=%s")
                values.append(data[key])
        
        if not updates:
            return jsonify({"status": "failed", "message": "No fields to update"}), 400
        
        values.append(expense_id)
        cursor = connection.cursor()
        query = f"UPDATE expenses SET {', '.join(updates)} WHERE id=%s"
        cursor.execute(query, values)
        connection.commit()
        cursor.close()
        connection.close()
        
        return jsonify({"status": "success", "message": "Expense updated"}), 200
    
    except Exception as e:
        return jsonify({"status": "failed", "message": str(e)}), 500

@app.route("/expenses/<expense_id>", methods=["DELETE"])
def delete_expense(expense_id):
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({"status": "failed", "message": "Database connection error"}), 500
        
        cursor = connection.cursor()
        # Check if expense exists
        cursor.execute("SELECT id FROM expenses WHERE id=%s", (expense_id,))
        expense = cursor.fetchone()
        
        if not expense:
            cursor.close()
            connection.close()
            return jsonify({"status": "failed", "message": "Expense not found"}), 404
        
        # Delete the expense
        cursor.execute("DELETE FROM expenses WHERE id=%s", (expense_id,))
        connection.commit()
        cursor.close()
        connection.close()
        
        return jsonify({"status": "success", "message": "Expense deleted"}), 200
    
    except Exception as e:
        return jsonify({"status": "failed", "message": str(e)}), 500


@app.route("/licenses", methods=["GET"])
def get_licenses():
    try:
        dept_id = request.args.get("dept_id")
        connection = get_db_connection()
        if not connection:
            return jsonify({"status": "failed", "message": "Database connection error"}), 500
        
        cursor = connection.cursor()
        if dept_id:
            query = "SELECT id, dept_id, software, total_purchased, used, cost_per_license FROM licenses WHERE dept_id=%s"
            cursor.execute(query, (dept_id,))
        else:
            query = "SELECT id, dept_id, software, total_purchased, used, cost_per_license FROM licenses"
            cursor.execute(query)
        
        licenses = fetch_all_as_dict(cursor)
        cursor.close()
        connection.close()
        
        return jsonify({"status": "success", "licenses": licenses}), 200
    
    except Exception as e:
        return jsonify({"status": "failed", "message": str(e)}), 500

@app.route("/licenses", methods=["POST"])
def create_license():
    try:
        data = request.json
        license_id = data.get("id") or f"l{datetime.now().timestamp()}"
        dept_id = data.get("dept_id")
        software = data.get("software")
        total_purchased = data.get("total_purchased")
        used = data.get("used", 0)
        cost_per_license = data.get("cost_per_license")
        
        if not all([dept_id, software, total_purchased, cost_per_license]):
            return jsonify({"status": "failed", "message": "dept_id, software, total_purchased, and cost_per_license required"}), 400
        
        connection = get_db_connection()
        if not connection:
            return jsonify({"status": "failed", "message": "Database connection error"}), 500
        
        cursor = connection.cursor()
        query = "INSERT INTO licenses (id, dept_id, software, total_purchased, used, cost_per_license) VALUES (%s, %s, %s, %s, %s, %s)"
        cursor.execute(query, (license_id, dept_id, software, total_purchased, used, cost_per_license))
        connection.commit()
        cursor.close()
        connection.close()
        
        return jsonify({"status": "success", "message": "License created", "id": license_id}), 201
    
    except Exception as e:
        return jsonify({"status": "failed", "message": str(e)}), 500

@app.route("/licenses/<license_id>", methods=["PUT"])
def update_license(license_id):
    try:
        data = request.json
        used = data.get("used")
        if used is None:
            return jsonify({"status": "failed", "message": "used field required"}), 400
        connection = get_db_connection()
        if not connection:
            return jsonify({"status": "failed", "message": "Database connection error"}), 500
        cursor = connection.cursor()
        cursor.execute("UPDATE licenses SET used=%s WHERE id=%s", (used, license_id))
        connection.commit()
        cursor.close()
        connection.close()
        return jsonify({"status": "success", "message": "License updated"}), 200
    except Exception as e:
        return jsonify({"status": "failed", "message": str(e)}), 500


# ==================== BUDGETS (yearly per department) ====================
@app.route("/budgets", methods=["GET"])
def get_budgets():
    try:
        dept_id = request.args.get("department_id")
        year = request.args.get("year", type=int)
        connection = get_db_connection()
        if not connection:
            return jsonify({"status": "failed", "message": "Database connection error"}), 500
        cursor = connection.cursor()
        try:
            if dept_id and year:
                cursor.execute(
                    "SELECT id, department_id, year, allocated_amount, created_at FROM budgets WHERE department_id=%s AND year=%s",
                    (dept_id, year),
                )
            elif dept_id:
                cursor.execute("SELECT id, department_id, year, allocated_amount, created_at FROM budgets WHERE department_id=%s ORDER BY year DESC", (dept_id,))
            elif year:
                cursor.execute("SELECT id, department_id, year, allocated_amount, created_at FROM budgets WHERE year=%s ORDER BY department_id", (year,))
            else:
                cursor.execute("SELECT id, department_id, year, allocated_amount, created_at FROM budgets ORDER BY year DESC, department_id")
            rows = fetch_all_as_dict(cursor)
        except Exception:
            rows = []
        cursor.close()
        connection.close()
        return jsonify({"status": "success", "budgets": rows}), 200
    except Exception as e:
        return jsonify({"status": "failed", "message": str(e)}), 500


@app.route("/budgets", methods=["POST"])
def create_or_update_budget():
    try:
        data = request.json
        department_id = data.get("department_id")
        year = data.get("year", datetime.now().year)
        allocated_amount = float(data.get("allocated_amount", 0))
        if not department_id:
            return jsonify({"status": "failed", "message": "department_id required"}), 400
        connection = get_db_connection()
        if not connection:
            return jsonify({"status": "failed", "message": "Database connection error"}), 500
        cursor = connection.cursor()
        try:
            cursor.execute(
                "INSERT INTO budgets (department_id, year, allocated_amount) VALUES (%s, %s, %s) ON DUPLICATE KEY UPDATE allocated_amount = VALUES(allocated_amount)",
                (department_id, year, allocated_amount),
            )
        except Exception:
            cursor.execute(
                "INSERT INTO budgets (department_id, year, allocated_amount) VALUES (%s, %s, %s)",
                (department_id, year, allocated_amount),
            )
        connection.commit()
        cursor.close()
        connection.close()
        return jsonify({"status": "success", "message": "Budget saved"}), 201
    except Exception as e:
        return jsonify({"status": "failed", "message": str(e)}), 500


# ==================== VENDORS ====================
@app.route("/vendors", methods=["GET"])
def get_vendors():
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({"status": "failed", "message": "Database connection error"}), 500
        cursor = connection.cursor()
        try:
            cursor.execute(
                "SELECT id, name, contact_email, annual_contract_value, contract_start_date, contract_end_date, created_at FROM vendors ORDER BY name"
            )
            rows = fetch_all_as_dict(cursor)
        except Exception:
            rows = []
        cursor.close()
        connection.close()
        return jsonify({"status": "success", "vendors": rows}), 200
    except Exception as e:
        return jsonify({"status": "failed", "message": str(e)}), 500


@app.route("/vendors", methods=["POST"])
def create_vendor():
    try:
        data = request.json
        name = (data.get("name") or "").strip()
        contact_email = data.get("contact_email") or ""
        annual_contract_value = data.get("annual_contract_value")
        contract_start_date = data.get("contract_start_date")
        contract_end_date = data.get("contract_end_date")
        if not name:
            return jsonify({"status": "failed", "message": "name required"}), 400
        connection = get_db_connection()
        if not connection:
            return jsonify({"status": "failed", "message": "Database connection error"}), 500
        cursor = connection.cursor()
        cursor.execute(
            "INSERT INTO vendors (name, contact_email, annual_contract_value, contract_start_date, contract_end_date) VALUES (%s, %s, %s, %s, %s)",
            (name, contact_email or None, annual_contract_value or None, contract_start_date or None, contract_end_date or None),
        )
        connection.commit()
        vid = cursor.lastrowid
        cursor.close()
        connection.close()
        return jsonify({"status": "success", "message": "Vendor created", "id": vid}), 201
    except Exception as e:
        return jsonify({"status": "failed", "message": str(e)}), 500


@app.route("/vendors/<int:vendor_id>", methods=["PUT"])
def update_vendor(vendor_id):
    try:
        data = request.json
        connection = get_db_connection()
        if not connection:
            return jsonify({"status": "failed", "message": "Database connection error"}), 500
        cursor = connection.cursor()
        updates = []
        values = []
        for key, col in [("name", "name"), ("contact_email", "contact_email"), ("annual_contract_value", "annual_contract_value"), ("contract_start_date", "contract_start_date"), ("contract_end_date", "contract_end_date")]:
            if key in data:
                updates.append(f"{col}=%s")
                values.append(data[key])
        if not updates:
            cursor.close()
            connection.close()
            return jsonify({"status": "failed", "message": "No fields to update"}), 400
        values.append(vendor_id)
        cursor.execute(f"UPDATE vendors SET {', '.join(updates)} WHERE id=%s", values)
        connection.commit()
        cursor.close()
        connection.close()
        return jsonify({"status": "success", "message": "Vendor updated"}), 200
    except Exception as e:
        return jsonify({"status": "failed", "message": str(e)}), 500


@app.route("/vendors/<int:vendor_id>", methods=["DELETE"])
def delete_vendor(vendor_id):
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({"status": "failed", "message": "Database connection error"}), 500
        cursor = connection.cursor()
        cursor.execute("DELETE FROM vendors WHERE id=%s", (vendor_id,))
        connection.commit()
        cursor.close()
        connection.close()
        return jsonify({"status": "success", "message": "Vendor deleted"}), 200
    except Exception as e:
        return jsonify({"status": "failed", "message": str(e)}), 500


# ==================== SOFTWARE LICENSES (expiry tracking) ====================
@app.route("/software-licenses", methods=["GET"])
def get_software_licenses():
    try:
        dept_id = request.args.get("department_id")
        connection = get_db_connection()
        if not connection:
            return jsonify({"status": "failed", "message": "Database connection error"}), 500
        cursor = connection.cursor()
        try:
            if dept_id:
                cursor.execute(
                    "SELECT sl.id, sl.department_id, sl.vendor_id, sl.software_name, sl.purchase_date, sl.expiry_date, sl.renewal_cost, sl.created_at FROM software_licenses sl WHERE sl.department_id=%s ORDER BY sl.expiry_date",
                    (dept_id,),
                )
            else:
                cursor.execute(
                    "SELECT sl.id, sl.department_id, sl.vendor_id, sl.software_name, sl.purchase_date, sl.expiry_date, sl.renewal_cost, sl.created_at FROM software_licenses sl ORDER BY sl.expiry_date"
                )
            rows = fetch_all_as_dict(cursor)
        except Exception:
            rows = []
        cursor.close()
        connection.close()
        return jsonify({"status": "success", "software_licenses": rows}), 200
    except Exception as e:
        return jsonify({"status": "failed", "message": str(e)}), 500


@app.route("/software-licenses", methods=["POST"])
def create_software_license():
    try:
        data = request.json
        department_id = data.get("department_id")
        vendor_id = data.get("vendor_id")
        software_name = (data.get("software_name") or "").strip()
        purchase_date = data.get("purchase_date")
        expiry_date = data.get("expiry_date")
        renewal_cost = data.get("renewal_cost")
        if not department_id or not software_name:
            return jsonify({"status": "failed", "message": "department_id and software_name required"}), 400
        connection = get_db_connection()
        if not connection:
            return jsonify({"status": "failed", "message": "Database connection error"}), 500
        cursor = connection.cursor()
        cursor.execute(
            "INSERT INTO software_licenses (department_id, vendor_id, software_name, purchase_date, expiry_date, renewal_cost) VALUES (%s, %s, %s, %s, %s, %s)",
            (department_id, vendor_id or None, software_name, purchase_date or None, expiry_date or None, renewal_cost or None),
        )
        connection.commit()
        lid = cursor.lastrowid
        cursor.close()
        connection.close()
        return jsonify({"status": "success", "message": "Software license created", "id": lid}), 201
    except Exception as e:
        return jsonify({"status": "failed", "message": str(e)}), 500


@app.route("/software-licenses/<int:license_id>", methods=["PUT"])
def update_software_license(license_id):
    try:
        data = request.json
        connection = get_db_connection()
        if not connection:
            return jsonify({"status": "failed", "message": "Database connection error"}), 500
        cursor = connection.cursor()
        updates = []
        values = []
        for key, col in [("software_name", "software_name"), ("vendor_id", "vendor_id"), ("purchase_date", "purchase_date"), ("expiry_date", "expiry_date"), ("renewal_cost", "renewal_cost")]:
            if key in data:
                updates.append(f"{col}=%s")
                values.append(data[key])
        if not updates:
            cursor.close()
            connection.close()
            return jsonify({"status": "failed", "message": "No fields to update"}), 400
        values.append(license_id)
        cursor.execute(f"UPDATE software_licenses SET {', '.join(updates)} WHERE id=%s", values)
        connection.commit()
        cursor.close()
        connection.close()
        return jsonify({"status": "success", "message": "Software license updated"}), 200
    except Exception as e:
        return jsonify({"status": "failed", "message": str(e)}), 500


# ==================== FORECASTS (store predictions) ====================
@app.route("/forecasts", methods=["GET"])
def get_forecasts():
    try:
        dept_id = request.args.get("department_id")
        forecast_type = request.args.get("forecast_type")
        limit = request.args.get("limit", type=int) or 50
        connection = get_db_connection()
        if not connection:
            return jsonify({"status": "failed", "message": "Database connection error"}), 500
        cursor = connection.cursor()
        try:
            if dept_id and forecast_type:
                cursor.execute(
                    "SELECT id, department_id, forecast_type, predicted_value, created_at FROM forecasts WHERE department_id=%s AND forecast_type=%s ORDER BY created_at DESC LIMIT %s",
                    (dept_id, forecast_type, limit),
                )
            elif dept_id:
                cursor.execute(
                    "SELECT id, department_id, forecast_type, predicted_value, created_at FROM forecasts WHERE department_id=%s ORDER BY created_at DESC LIMIT %s",
                    (dept_id, limit),
                )
            else:
                cursor.execute(
                    "SELECT id, department_id, forecast_type, predicted_value, created_at FROM forecasts ORDER BY created_at DESC LIMIT %s",
                    (limit,),
                )
            rows = fetch_all_as_dict(cursor)
        except Exception:
            rows = []
        cursor.close()
        connection.close()
        return jsonify({"status": "success", "forecasts": rows}), 200
    except Exception as e:
        return jsonify({"status": "failed", "message": str(e)}), 500


@app.route("/forecasts/generate", methods=["POST"])
def generate_forecasts():
    try:
        data = request.json or {}
        department_id = data.get("department_id")
        connection = get_db_connection()
        if not connection:
            return jsonify({"status": "failed", "message": "Database connection error"}), 500
        cursor = connection.cursor()
        try:
            cursor.execute("SELECT id FROM departments")
            depts = [r[0] for r in cursor.fetchall()]
        except Exception:
            depts = []
        if department_id:
            depts = [d for d in depts if d == department_id]
        current_year = datetime.now().year
        results = []
        for dept_id in depts:
            monthly_totals, next_month_pred, next_year_pred, actual, predicted, mape, accuracy = _predict_for_department(cursor, dept_id)
            try:
                cursor.execute(
                    "INSERT INTO forecasts (department_id, forecast_type, predicted_value) VALUES (%s, 'monthly', %s), (%s, 'yearly', %s)",
                    (dept_id, next_month_pred, dept_id, next_year_pred),
                )
                connection.commit()
            except Exception:
                pass
            results.append({
                "department_id": dept_id,
                "forecast_next_month": round(next_month_pred, 2),
                "forecast_next_year": round(next_year_pred, 2),
                "actual_expense": round(float(actual), 2) if actual is not None else None,
                "predicted_expense": round(float(predicted), 2) if predicted is not None else None,
                "mape": round(float(mape), 2) if mape is not None else None,
                "accuracy": round(float(accuracy), 2) if accuracy is not None else None,
            })
        cursor.close()
        connection.close()
        return jsonify({"status": "success", "forecasts": results}), 200
    except Exception as e:
        return jsonify({"status": "failed", "message": str(e)}), 500


@app.route("/forecasts/evaluate", methods=["GET"])
def evaluate_forecasts():
    """Return evaluation values for dashboard rendering instead of terminal prints."""
    try:
        dept_filter = request.args.get("department_id")
        connection = get_db_connection()
        if not connection:
            return jsonify({"status": "failed", "message": "Database connection error"}), 500

        cursor = connection.cursor()
        try:
            cursor.execute("SELECT id, name FROM departments ORDER BY name")
            departments = cursor.fetchall()
        except Exception:
            departments = []

        if dept_filter:
            departments = [d for d in departments if str(d[0]) == str(dept_filter)]

        results = []
        for dept_id, dept_name in departments:
            _, next_month_pred, _, actual, predicted, mape, accuracy = _predict_for_department(cursor, dept_id)

            results.append(
                {
                    "department_id": dept_id,
                    "department_name": dept_name,
                    "actual_expense": round(float(actual), 2) if actual is not None else None,
                    "predicted_expense": round(float(predicted), 2) if predicted is not None else round(float(next_month_pred), 2),
                    "mape": round(float(mape), 2) if mape is not None else None,
                    "accuracy": round(float(accuracy), 2) if accuracy is not None else None,
                }
            )

        cursor.close()
        connection.close()
        return jsonify({"status": "success", "forecast_evaluation": results}), 200
    except Exception as e:
        return jsonify({"status": "failed", "message": str(e)}), 500


# ==================== OPTIMIZATION (suggestions) ====================
@app.route("/optimization", methods=["GET"])
def get_optimization_logs():
    try:
        dept_id = request.args.get("department_id")
        limit = request.args.get("limit", type=int) or 100
        connection = get_db_connection()
        if not connection:
            return jsonify({"status": "failed", "message": "Database connection error"}), 500
        cursor = connection.cursor()
        try:
            if dept_id:
                cursor.execute(
                    "SELECT id, department_id, suggestion_text, created_at FROM optimization_logs WHERE department_id=%s ORDER BY created_at DESC LIMIT %s",
                    (dept_id, limit),
                )
            else:
                cursor.execute(
                    "SELECT id, department_id, suggestion_text, created_at FROM optimization_logs ORDER BY created_at DESC LIMIT %s",
                    (limit,),
                )
            rows = fetch_all_as_dict(cursor)
        except Exception:
            rows = []
        cursor.close()
        connection.close()
        return jsonify({"status": "success", "suggestions": rows}), 200
    except Exception as e:
        return jsonify({"status": "failed", "message": str(e)}), 500


@app.route("/optimization/generate", methods=["POST"])
def generate_optimization():
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({"status": "failed", "message": "Database connection error"}), 500
        cursor = connection.cursor()
        current_year = datetime.now().year
        prev_year = current_year - 1
        try:
            cursor.execute("SELECT id, name FROM departments")
            departments = fetch_all_as_dict(cursor)
        except Exception:
            departments = []
        for dept in departments:
            dept_id = dept["id"]
            dept_name = dept.get("name", "")
            try:
                cursor.execute(
                    "SELECT allocated_amount FROM budgets WHERE department_id=%s AND year=%s",
                    (dept_id, current_year),
                )
                row = cursor.fetchone()
                allocated = float(row[0]) if row and row[0] is not None else 0
            except Exception:
                try:
                    cursor.execute("SELECT budget FROM departments WHERE id=%s", (dept_id,))
                    r = cursor.fetchone()
                    allocated = float(r[0]) if r and r[0] is not None else 0
                except Exception:
                    allocated = 0
            cursor.execute(
                "SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE dept_id=%s AND year=%s",
                (dept_id, current_year),
            )
            row = cursor.fetchone()
            spending_current = float(row[0]) if row and row[0] is not None else 0
            cursor.execute(
                "SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE dept_id=%s AND year=%s",
                (dept_id, prev_year),
            )
            row = cursor.fetchone()
            spending_prev = float(row[0]) if row and row[0] is not None else 0
            utilization_current = (spending_current / allocated * 100) if allocated else 0
            utilization_prev = (spending_prev / allocated * 100) if allocated else None
            cursor.execute(
                "SELECT predicted_value FROM forecasts WHERE department_id=%s AND forecast_type='yearly' ORDER BY created_at DESC LIMIT 1",
                (dept_id,),
            )
            row = cursor.fetchone()
            forecast_next_year = float(row[0]) if row and row[0] is not None else 0
            suggestions = generate_suggestions(
                department_id=dept_id,
                department_name=dept_name,
                allocated_budget=allocated,
                total_spending=spending_current,
                forecast_next_year=forecast_next_year,
                utilization_current=utilization_current,
                utilization_previous=utilization_prev,
                spending_current_year=spending_current,
                spending_previous_year=spending_prev,
            )
            for text in suggestions:
                try:
                    cursor.execute(
                        "INSERT INTO optimization_logs (department_id, suggestion_text) VALUES (%s, %s)",
                        (dept_id, text[:5000]),
                    )
                except Exception:
                    pass
        connection.commit()
        cursor.close()
        connection.close()
        return jsonify({"status": "success", "message": "Optimization suggestions generated"}), 200
    except Exception as e:
        return jsonify({"status": "failed", "message": str(e)}), 500


# ==================== ALERTS: license expiry 30d, vendor contract 60d ====================
@app.route("/alerts/licenses-expiring", methods=["GET"])
def get_license_expiry_alerts():
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({"status": "failed", "message": "Database connection error"}), 500
        cursor = connection.cursor()
        try:
            cursor.execute(
                """
                SELECT sl.id, sl.department_id, sl.software_name, sl.expiry_date, sl.renewal_cost, d.name as department_name
                FROM software_licenses sl
                LEFT JOIN departments d ON d.id = sl.department_id
                WHERE sl.expiry_date IS NOT NULL AND sl.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) AND sl.expiry_date >= CURDATE()
                ORDER BY sl.expiry_date
                """
            )
            rows = fetch_all_as_dict(cursor)
        except Exception:
            rows = []
        cursor.close()
        connection.close()
        return jsonify({"status": "success", "alerts": rows}), 200
    except Exception as e:
        return jsonify({"status": "failed", "message": str(e)}), 500


@app.route("/alerts/vendors-expiring", methods=["GET"])
def get_vendor_contract_alerts():
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({"status": "failed", "message": "Database connection error"}), 500
        cursor = connection.cursor()
        try:
            cursor.execute(
                """
                SELECT id, name, contact_email, annual_contract_value, contract_end_date
                FROM vendors
                WHERE contract_end_date IS NOT NULL AND contract_end_date <= DATE_ADD(CURDATE(), INTERVAL 60 DAY) AND contract_end_date >= CURDATE()
                ORDER BY contract_end_date
                """
            )
            rows = fetch_all_as_dict(cursor)
        except Exception:
            rows = []
        cursor.close()
        connection.close()
        return jsonify({"status": "success", "alerts": rows}), 200
    except Exception as e:
        return jsonify({"status": "failed", "message": str(e)}), 500


@app.route("/dashboard/department/<dept_id>", methods=["GET"])
def department_dashboard(dept_id):
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({"status": "failed", "message": "Database connection error"}), 500
        cursor = connection.cursor()
        cursor.execute("SELECT id, name, budget FROM departments WHERE id=%s", (dept_id,))
        dept = cursor.fetchone()
        if not dept:
            cursor.close()
            connection.close()
            return jsonify({"status": "failed", "message": "Department not found"}), 404
        current_year = datetime.now().year
        allocated_budget = float(dept[2]) if dept[2] is not None else 0
        try:
            cursor.execute("SELECT allocated_amount FROM budgets WHERE department_id=%s AND year=%s", (dept_id, current_year))
            row = cursor.fetchone()
            if row and row[0] is not None:
                allocated_budget = float(row[0])
        except Exception:
            pass
        try:
            cursor.execute("SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE dept_id=%s AND year=%s", (dept_id, current_year))
            row = cursor.fetchone()
            total_spending = float(row[0]) if row and row[0] is not None else 0
        except Exception:
            cursor.execute("SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE dept_id=%s", (dept_id,))
            row = cursor.fetchone()
            total_spending = float(row[0]) if row and row[0] is not None else 0
        remaining_budget = allocated_budget - total_spending
        utilization_pct = (total_spending / allocated_budget * 100) if allocated_budget else 0
        try:
            cursor.execute("SELECT COALESCE(category, category_id), SUM(amount) as total FROM expenses WHERE dept_id=%s GROUP BY COALESCE(category, category_id)", (dept_id,))
            expenses_by_category = fetch_all_as_dict(cursor)
        except Exception:
            cursor.execute("SELECT category, SUM(amount) as total FROM expenses WHERE dept_id=%s GROUP BY category", (dept_id,))
            expenses_by_category = fetch_all_as_dict(cursor)
        cursor.execute("SELECT month, SUM(amount) as total FROM expenses WHERE dept_id=%s GROUP BY month ORDER BY month", (dept_id,))
        monthly_trends = fetch_all_as_dict(cursor)
        cursor.execute("SELECT SUM(amount) as total FROM expenses WHERE dept_id=%s AND month = DATE_FORMAT(CURDATE(), '%%Y-%%m')", (dept_id,))
        row = cursor.fetchone()
        monthly_total_value = float(row[0]) if row and row[0] is not None else 0
        # _, forecast_next_month, forecast_next_year = _predict_for_department(cursor, dept_id)
        _, forecast_next_month, forecast_next_year, actual, pred, mape, accuracy = _predict_for_department(cursor, dept_id)
        try:
            cursor.execute("SELECT id, software, total_purchased, used FROM licenses WHERE dept_id=%s", (dept_id,))
            licenses = fetch_all_as_dict(cursor)
        except Exception:
            licenses = []
        cursor.close()
        connection.close()
        return jsonify({
            "status": "success",
            "department": {"id": dept[0], "name": dept[1], "budget": allocated_budget},
            "total_spending": total_spending,
            "remaining_budget": remaining_budget,
            "utilization_percentage": round(utilization_pct, 2),
            "expenses_by_category": expenses_by_category,
            "monthly_trends": monthly_trends,
            "monthly_total": monthly_total_value,
            "forecast_next_month": round(forecast_next_month, 2),
            "forecast_next_year": round(forecast_next_year, 2),
            "actual_expense": round(float(actual), 2) if actual is not None else None,
            "predicted_expense": round(float(pred), 2) if pred is not None else None,
            "mape": mape,
            "accuracy": accuracy,
            "licenses": licenses,
        }), 200
    except Exception as e:
        return jsonify({"status": "failed", "message": str(e)}), 500


@app.route("/dashboard/admin", methods=["GET"])
def admin_dashboard():
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({"status": "failed", "message": "Database connection error"}), 500
        cursor = connection.cursor()
        current_year = datetime.now().year
        cursor.execute("SELECT id, name, budget FROM departments ORDER BY name")
        dept_rows = cursor.fetchall()
        cols = [d[0] for d in cursor.description]
        departments = [dict(zip(cols, r)) for r in dept_rows]
        try:
            cursor.execute("SELECT department_id, allocated_amount FROM budgets WHERE year=%s", (current_year,))
            budget_rows = cursor.fetchall()
            budget_cols = [d[0] for d in cursor.description]
            budget_by_dept = {r[budget_cols.index("department_id")]: float(r[budget_cols.index("allocated_amount")]) for r in budget_rows}
        except Exception:
            budget_by_dept = {}
        total_allocated = 0
        dept_summaries = []
        for d in departments:
            dept_id = d["id"]
            alloc = budget_by_dept.get(dept_id)
            if alloc is None:
                alloc = float(d["budget"]) if d.get("budget") is not None else 0
            total_allocated += alloc
            # Calculate spent amount - try with year filter first, then without
            spent = 0
            try:
                cursor.execute("SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE dept_id=%s AND (year=%s OR year IS NULL)", (dept_id, current_year))
                row = cursor.fetchone()
                spent = float(row[0]) if row and row[0] is not None else 0
            except Exception:
                # Fallback if year column doesn't exist
                try:
                    cursor.execute("SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE dept_id=%s", (dept_id,))
                    row = cursor.fetchone()
                    spent = float(row[0]) if row and row[0] is not None else 0
                except Exception:
                    spent = 0
            remaining = alloc - spent
            util = (spent / alloc * 100) if alloc else 0
            variance = alloc - spent
            dept_summaries.append({
                "id": dept_id,
                "name": d["name"],
                "allocated_amount": alloc,
                "spent": spent,
                "remaining": remaining,
                "utilization_percentage": round(util, 2),
                "variance": variance,
            })
        total_spent = sum(d["spent"] for d in dept_summaries)
        total_remaining = total_allocated - total_spent
        overall_utilization = (total_spent / total_allocated * 100) if total_allocated else 0
        try:
            cursor.execute("SELECT COALESCE(category, category_id), SUM(amount) as total FROM expenses WHERE year=%s OR year IS NULL GROUP BY COALESCE(category, category_id) ORDER BY total DESC", (current_year,))
            spending_by_category = fetch_all_as_dict(cursor)
        except Exception:
            cursor.execute("SELECT category, SUM(amount) as total FROM expenses GROUP BY category ORDER BY total DESC")
            spending_by_category = fetch_all_as_dict(cursor)
        cursor.execute("SELECT month, SUM(amount) as total FROM expenses GROUP BY month ORDER BY month")
        monthly_trends = fetch_all_as_dict(cursor)
        try:
            cursor.execute("SELECT software, SUM(total_purchased * cost_per_license) as total_cost FROM licenses GROUP BY software ORDER BY total_cost DESC LIMIT 10")
            top_licenses = fetch_all_as_dict(cursor)
        except Exception:
            top_licenses = []
        try:
            cursor.execute(
                "SELECT sl.id, sl.department_id, sl.software_name, sl.expiry_date, sl.renewal_cost, d.name as department_name FROM software_licenses sl LEFT JOIN departments d ON d.id = sl.department_id WHERE sl.expiry_date IS NOT NULL AND sl.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) AND sl.expiry_date >= CURDATE() ORDER BY sl.expiry_date"
            )
            license_expiry_alerts = fetch_all_as_dict(cursor)
        except Exception:
            license_expiry_alerts = []
        try:
            cursor.execute("SELECT id, name, contact_email, annual_contract_value, contract_end_date FROM vendors WHERE contract_end_date IS NOT NULL AND contract_end_date <= DATE_ADD(CURDATE(), INTERVAL 60 DAY) AND contract_end_date >= CURDATE() ORDER BY contract_end_date")
            vendor_expiry_alerts = fetch_all_as_dict(cursor)
        except Exception:
            vendor_expiry_alerts = []
        try:
            cursor.execute("SELECT id, department_id, suggestion_text, created_at FROM optimization_logs ORDER BY created_at DESC LIMIT 20")
            optimization_suggestions = fetch_all_as_dict(cursor)
        except Exception:
            optimization_suggestions = []
        forecast_next_month = {}
        forecast_next_year = {}
        for d in departments:
            dept_id = d["id"]
            _, next_month_pred, next_year_pred, _, _, _, _ = _predict_for_department(cursor, dept_id)
            forecast_next_month[dept_id] = round(next_month_pred, 2)
            forecast_next_year[dept_id] = round(next_year_pred, 2)
        cursor.close()
        connection.close()
        return jsonify({
            "status": "success",
            "total_allocated_budget": total_allocated,
            "total_actual_spending": total_spent,
            "remaining_budget": total_remaining,
            "overall_utilization_percentage": round(overall_utilization, 2),
            "departments": dept_summaries,
            "spending_by_category": spending_by_category,
            "monthly_trends": monthly_trends,
            "top_licenses": top_licenses,
            "variance": total_allocated - total_spent,
            "forecast_next_month_by_department": forecast_next_month,
            "forecast_next_year_by_department": forecast_next_year,
            "license_expiry_alerts": license_expiry_alerts,
            "vendor_contract_expiry_alerts": vendor_expiry_alerts,
            "optimization_suggestions": optimization_suggestions,
        }), 200
    except Exception as e:
        return jsonify({"status": "failed", "message": str(e)}), 500

# ==================== HEALTH CHECK ====================
@app.route("/test-db", methods=["GET"])
def test_db():
    """Test database connectivity"""
    try:
        connection = get_db_connection()
        if not connection:
            hint = None
            if str(DB_CONFIG.get("host", "")).endswith("railway.internal"):
                hint = "Render cannot use Railway internal host. Use Railway Public TCP host/port or set DATABASE_URL from Railway public connection string."
            return jsonify({
                "status": "failed",
                "message": "Failed to connect to database",
                "db_host": DB_CONFIG.get("host"),
                "db_port": DB_CONFIG.get("port"),
                "db_name": DB_CONFIG.get("database"),
                "config_source": DB_CONFIG_SOURCE,
                "hint": hint,
            }), 500
        
        cursor = connection.cursor()
        cursor.execute("SELECT 1")
        result = cursor.fetchone()
        cursor.close()
        connection.close()
        
        if result:
            return jsonify({
                "status": "success",
                "message": "Database connection successful",
                "timestamp": datetime.now().isoformat()
            }), 200
        else:
            return jsonify({"status": "failed", "message": "Database query failed"}), 500
    except Exception as e:
        return jsonify({
            "status": "failed",
            "message": str(e),
            "error_type": type(e).__name__
        }), 500

@app.route("/health", methods=["GET"])
def health_check():
    """Simple health check endpoint"""
    return jsonify({"status": "ok", "timestamp": datetime.now().isoformat()}), 200

@app.errorhandler(404)
def not_found(error):
    return jsonify({"status": "failed", "message": "Endpoint not found"}), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({"status": "failed", "message": "Internal server error"}), 500


if __name__ == "__main__":
    # Debug mode should be False in production (Gunicorn will handle it)
    app.run(debug=os.environ.get("FLASK_DEBUG", "False").lower() == "true", host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))

