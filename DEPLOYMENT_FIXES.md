# Backend Deployment Fixes & Configuration Guide

## ✅ Fixes Applied to Flask Backend

### 1. **CORS Configuration (CRITICAL FIX)**
**Issue**: `CORS(app)` was allowing requests from ANY origin
```python
# ❌ BEFORE (insecure)
CORS(app)

# ✅ AFTER (restricted to Vercel frontend)
CORS(app, resources={
    r"/*": {
        "origins": ["https://it-budget-planning-system.vercel.app"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})
```

### 2. **Database Configuration (CRITICAL FIX)**
**Issue**: Using `os.getenv()` with hardcoded values instead of environment variable names
```python
# ❌ BEFORE (broken - hardcoded credentials exposed)
DB_CONFIG = {
    "host": os.getenv("mysql.railway.internal"),  # Wrong: treating value as key
    "password": os.getenv("EFJtobVOajQgDUUrtlGMUEsgDlSDrGBo"),  # EXPOSED PASSWORD!
    "database": os.getenv("railway"),
}

# ✅ AFTER (proper environment variables)
DB_CONFIG = {
    "host": os.environ.get("DB_HOST", "localhost"),
    "port": int(os.environ.get("DB_PORT", 3306)),
    "user": os.environ.get("DB_USER", "root"),
    "password": os.environ.get("DB_PASSWORD", ""),
    "database": os.environ.get("DB_NAME", "it_budget_buddy"),
}
```

### 3. **Debug Mode (CRITICAL FIX)**
**Issue**: Flask running with `debug=True` in production
```python
# ❌ BEFORE
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)

# ✅ AFTER (respects environment variable)
if __name__ == "__main__":
    app.run(
        debug=os.environ.get("FLASK_DEBUG", "False").lower() == "true",
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5000))
    )
```

### 4. **Added Health Check Routes**
```python
# New routes added:
GET /health          → Simple health check (always returns 200)
GET /test-db         → Database connectivity test with diagnostics
```

### 5. **Updated Dependencies**
Added to `requirements.txt`:
- ✅ `gunicorn==21.2.0` - Production WSGI server for Render
- ✅ `Werkzeug==2.3.7` - Fixed version for compatibility

---

## 🚀 Required Environment Variables for Render

Set these in your Render dashboard under **Environment Variables**:

```
DB_HOST=<your-railway-db-host>
DB_PORT=3306
DB_USER=root
DB_PASSWORD=<your-railway-password>
DB_NAME=railway
FLASK_ENV=production
FLASK_DEBUG=False
PORT=5000
```

### How to find Railway connection details:
1. Go to Railway Dashboard → Your Project
2. Click on MySQL service
3. Click "Connect"
4. Copy the "Private URL" which looks like: `mysql://root:<password>@mysql.railway.internal:3306/railway`

Extract from URL:
- **DB_HOST**: `mysql.railway.internal`
- **DB_USER**: `root`
- **DB_PASSWORD**: Everything after `:` and before `@`
- **DB_NAME**: `railway`

---

## 📋 Render Deployment Settings

### Start Command
In Render dashboard, set the **Build Command** and **Start Command**:

**Build Command** (optional):
```bash
pip install -r requirements.txt
```

**Start Command** (required):
```bash
gunicorn app:app
```

### Expected Port
- Render will automatically set PORT environment variable (usually 10000 or higher)
- Flask will read it from `os.environ.get("PORT", 5000)`

---

## ✅ Testing the Deployment

### 1. Test Health Check (no database needed)
```bash
curl https://it-budget-planning-system.onrender.com/health
```
Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-03-25T10:30:45.123456"
}
```

### 2. Test Database Connection
```bash
curl https://it-budget-planning-system.onrender.com/test-db
```
Expected response on success:
```json
{
  "status": "success",
  "message": "Database connection successful",
  "timestamp": "2024-03-25T10:30:45.123456"
}
```

Expected response on failure:
```json
{
  "status": "failed",
  "message": "Connection error details...",
  "error_type": "mysql.connector.errors.ProgrammingError",
  "db_host": "mysql.railway.internal",
  "db_name": "railway"
}
```

### 3. Test CORS Headers
```bash
curl -H "Origin: https://it-budget-planning-system.vercel.app" \
     -I https://it-budget-planning-system.onrender.com/health
```
You should see:
```
Access-Control-Allow-Origin: https://it-budget-planning-system.vercel.app
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## ⚠️ Additional Notes

### Frontend CORS Update
Make sure your frontend API calls point to the correct backend URL:
```typescript
// In your frontend API service
const API_URL = process.env.REACT_APP_API_URL || 
                'https://it-budget-planning-system.onrender.com';
```

### Database Connection Issues
If `/test-db` returns `"failed"`:
1. Verify Railway credentials are correctly set as environment variables
2. Check Railway service status in dashboard
3. Ensure `mysql.railway.internal` is accessible (use private URL for internal connections)
4. Check Render logs: `Settings → Logs` in Render dashboard

### Logging
Flask logs will appear in Render dashboard → **Logs** tab. Monitor for:
- Connection timeouts
- Authentication failures
- Missing environment variables

---

## 🔒 Security Checklist

- ✅ CORS restricted to Vercel domain only
- ✅ No hardcoded credentials in code
- ✅ All sensitive data in environment variables
- ✅ Debug mode disabled in production
- ✅ Using proper WSGI server (Gunicorn)
- ⚠️ Remove any old comments with credentials from code

---

## 📝 Summary of Changes

| Component | Before | After |
|-----------|--------|-------|
| CORS | Open to all origins | Only Vercel frontend |
| DB Config | Broken `os.getenv()` with hardcoded values | Proper env variables |
| Debug Mode | `debug=True` | `debug=False` in production |
| WSGI Server | Flask development server | Gunicorn |
| Health Check | None | 2 endpoints added |
| Requirements | Missing Gunicorn | `gunicorn==21.2.0` added |

---

**Last Updated**: March 25, 2026
