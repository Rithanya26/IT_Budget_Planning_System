from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
from datetime import datetime
import json

app = Flask(__name__)
CORS(app)

DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'Rithanya2026',
    'database': 'it_budget_buddy',
    'raise_on_warnings': True
}

def get_db_connection():
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        if connection.is_connected():
            return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
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


@app.route("/")
def home():
    return jsonify({
        "message": "IT Budget Buddy API is running!",
        "endpoints": {
            "auth": "/login (POST)",
            "departments": "/departments (GET, POST)",
            "users": "/users (GET)",
            "expenses": "/expenses (GET, POST), /expenses/<id> (GET, PUT)",
            "licenses": "/licenses (GET, POST), /licenses/<id> (PUT)",
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

@app.route("/login", methods=["POST"])
def login():
    try:
        data = request.json
        username = data.get("username")
        password = data.get("password")
        
        if not username or not password:
            return jsonify({"status": "failed", "message": "Username and password required"}), 400
        
        connection = get_db_connection()
        if not connection:
            return jsonify({"status": "failed", "message": "Database connection error"}), 500
        
        cursor = connection.cursor()
        query = "SELECT id, username, display_name, role, dept_id FROM users WHERE username=%s AND password=%s AND is_active=TRUE"
        cursor.execute(query, (username, password))
        user = cursor.fetchone()
        if user:
            columns = [desc[0] for desc in cursor.description]
            user_dict = dict(zip(columns, user))
            cursor.close()
            connection.close()
            return jsonify({"status": "success", "user": user_dict}), 200
        else:
            cursor.close()
            connection.close()
            return jsonify({"status": "failed", "message": "Invalid credentials"}), 401
    
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
        username = data.get("username")
        password = data.get("password")
        display_name = data.get("display_name")
        role = data.get("role", "department")
        dept_id = data.get("dept_id")
        
        if not all([username, password, display_name]):
            return jsonify({"status": "failed", "message": "Username, password, and display_name required"}), 400
        
        connection = get_db_connection()
        if not connection:
            return jsonify({"status": "failed", "message": "Database connection error"}), 500
        
        cursor = connection.cursor()
        query = "INSERT INTO users (id, username, password, display_name, role, dept_id) VALUES (%s, %s, %s, %s, %s, %s)"
        cursor.execute(query, (user_id, username, password, display_name, role, dept_id))
        connection.commit()
        cursor.close()
        connection.close()
        
        return jsonify({"status": "success", "message": "User created", "id": user_id}), 201
    
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
        amount = data.get("amount")
        month = data.get("month")
        description = data.get("description")
        
        if not all([dept_id, category, amount, month]):
            return jsonify({"status": "failed", "message": "dept_id, category, amount, and month required"}), 400
        
        connection = get_db_connection()
        if not connection:
            return jsonify({"status": "failed", "message": "Database connection error"}), 500
        
        cursor = connection.cursor()
        query = "INSERT INTO expenses (id, dept_id, category, amount, month, description) VALUES (%s, %s, %s, %s, %s, %s)"
        cursor.execute(query, (expense_id, dept_id, category, amount, month, description))
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
        query = "UPDATE licenses SET used=%s WHERE id=%s"
        cursor.execute(query, (used, license_id))
        connection.commit()
        cursor.close()
        connection.close()
        
        return jsonify({"status": "success", "message": "License updated"}), 200
    
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
        
        cursor.execute("SELECT category, SUM(amount) as total FROM expenses WHERE dept_id=%s GROUP BY category", (dept_id,))
        expenses_by_category = fetch_all_as_dict(cursor)
        
        cursor.execute("SELECT SUM(amount) as total FROM expenses WHERE dept_id=%s AND month = DATE_FORMAT(CURDATE(), '%%Y-%%m')", (dept_id,))
        monthly_total = cursor.fetchone()
        
        cursor.execute("SELECT id, software, total_purchased, used FROM licenses WHERE dept_id=%s", (dept_id,))
        licenses = fetch_all_as_dict(cursor)
        
        if not dept:
            cursor.close()
            connection.close()
            return jsonify({"status": "failed", "message": "Department not found"}), 404

        dept_dict = {"id": dept[0], "name": dept[1], "budget": dept[2]}
        monthly_total_value = 0
        if monthly_total and len(monthly_total) > 0 and monthly_total[0] is not None:
            monthly_total_value = monthly_total[0]

        cursor.close()
        connection.close()

        return jsonify({
            "status": "success",
            "department": dept_dict,
            "expenses_by_category": expenses_by_category,
            "monthly_total": monthly_total_value,
            "licenses": licenses
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
        
        cursor.execute("""
            SELECT d.id, d.name, d.budget, COALESCE(SUM(e.amount), 0) as spent
            FROM departments d
            LEFT JOIN expenses e ON d.id = e.dept_id
            GROUP BY d.id, d.name, d.budget
            ORDER BY spent DESC
        """)
        departments = fetch_all_as_dict(cursor)
        
        cursor.execute("""
            SELECT category, SUM(amount) as total
            FROM expenses
            GROUP BY category
            ORDER BY total DESC
        """)
        spending_by_category = fetch_all_as_dict(cursor)
        
        cursor.execute("""
            SELECT software, SUM(total_purchased * cost_per_license) as total_cost
            FROM licenses
            GROUP BY software
            ORDER BY total_cost DESC
            LIMIT 10
        """)
        top_licenses = fetch_all_as_dict(cursor)
        
        cursor.close()
        connection.close()
        
        return jsonify({
            "status": "success",
            "departments": departments,
            "spending_by_category": spending_by_category,
            "top_licenses": top_licenses
        }), 200
    
    except Exception as e:
        return jsonify({"status": "failed", "message": str(e)}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({"status": "failed", "message": "Endpoint not found"}), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({"status": "failed", "message": "Internal server error"}), 500


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)

