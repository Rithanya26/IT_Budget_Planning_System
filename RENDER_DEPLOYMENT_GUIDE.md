# Render Deployment Step-by-Step Guide

## Prerequisites
- Render account (render.com)
- GitHub repository with your IT Budget Buddy code
- Railway MySQL database already deployed
- Frontend already deployed on Vercel

---

## Step 1: Connect Your GitHub Repository to Render

1. Go to [render.com](https://render.com)
2. Click **"New +"** → **"Web Service"**
3. Select **"Connect a repository"**
4. Search for your repository: `IT-BUDGET-BUDDY`
5. Click **"Connect"**

---

## Step 2: Configure the Web Service

### Basic Settings
- **Name**: `it-budget-planning-system` (or any name you prefer)
- **Environment**: `Python 3`
- **Region**: Choose closest to your users (e.g., `us-east`)
- **Branch**: `main`

### Build Command
```bash
pip install -r backend/requirements.txt
```

### Start Command
```bash
cd backend && gunicorn app:app
```

### Instance Type
- **Free**: For testing only (will sleep after 15 min of inactivity)
- **Paid**: For production (never sleeps) — recommended

---

## Step 3: Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add each variable:

```
DB_HOST = mysql.railway.internal
DB_PORT = 3306
DB_USER = root
DB_PASSWORD = [paste from Railway]
DB_NAME = railway
FLASK_ENV = production
FLASK_DEBUG = False
```

### Getting Railway Credentials:
1. Open Railway dashboard
2. Click on your MySQL service
3. Click **"Connect"**
4. Look for "Private URL" (for internal Railway connections)
5. Format: `mysql://root:PASSWORD@mysql.railway.internal:3306/railway`

Extract each part:
- `DB_HOST`: `mysql.railway.internal`
- `DB_USER`: `root`
- `DB_PASSWORD`: The password part (between `:` and `@`)
- `DB_NAME`: `railway`

---

## Step 4: Deploy

1. Click **"Create Web Service"**
2. Render will automatically:
   - Build your app
   - Install dependencies
   - Start the server
3. Wait for "Live" status (takes 2-5 minutes)

---

## Step 5: Verify Deployment

### Test Health Endpoint
```bash
curl https://your-app.onrender.com/health
```

Response should be:
```json
{"status": "ok", "timestamp": "..."}
```

### Test Database Connection
```bash
curl https://your-app.onrender.com/test-db
```

Response should be:
```json
{
  "status": "success",
  "message": "Database connection successful",
  "timestamp": "..."
}
```

**If it fails**: Check Render logs for error messages

---

## Step 6: Update Your Frontend

Update the API base URL in your React app:

**Frontend `.env`:**
```
VITE_API_URL=https://your-app.onrender.com
```

Or update the API service file directly:
```typescript
// src/services/api.ts
const API_BASE_URL = process.env.REACT_APP_API_URL || 
                     'https://it-budget-planning-system.onrender.com';
```

---

## Step 7: Test the Integration

1. Go to your frontend: https://it-budget-planning-system.vercel.app
2. Try logging in or fetching data
3. Check browser DevTools → Network tab for any CORS errors
4. If errors occur, check Render logs

---

## Troubleshooting

### Build Failed
- Check that `requirements.txt` exists in `backend/` folder
- Verify all imports in `app.py` are correct
- Check Render logs for specific error

### "502 Bad Gateway" After Deploy
- Backend crashed. Check logs in Render dashboard
- Most common: Database connection error
- Verify all DB environment variables are correct

### CORS Errors in Browser
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Solution**: 
- Verify your Vercel frontend URL is in the CORS configuration
- Restart the web service in Render

**To Restart**: 
1. Go to Service Settings
2. Click "Manual Deploy" → "Deploy latest commit"

### Database Connection Timeout
**Causes**:
1. Wrong Railway credentials
2. Railway service is down
3. Network connectivity issue

**Fix**:
1. Test `/test-db` endpoint
2. Compare credentials with Railway dashboard
3. Check if Railway MySQL service is running

---

## Deployment Checklist

Before deploying, verify:

- [ ] `requirements.txt` updated with `gunicorn==21.2.0`
- [ ] `CORS` configured for your Vercel domain
- [ ] Database config uses environment variables (not hardcoded)
- [ ] Debug mode disabled (or set to False)
- [ ] `.env` file NOT committed to git
- [ ] All secrets in Render environment variables
- [ ] Start command is `cd backend && gunicorn app:app`
- [ ] Railway credentials are correct
- [ ] Frontend updated to use new backend URL

---

## Viewing Logs

**Real-time logs:**
1. Go to your Render service
2. Click **"Logs"** tab
3. Watch for errors as you test the app

**Common log entries to look for:**
```
DB Connection Error:  ← Database issue
CORS error           ← Frontend can't reach API
[werkzeug] ...       ← Flask request logs
```

---

## Useful Commands (Optional: if using Render CLI)

```bash
# Install Render CLI
npm install -g render-cli

# Login
render login

# Deploy
render deploy --api-key=YOUR_KEY
```

---

## After Deployment

### Monitor Performance
- Render Dashboard → Logs tab
- Watch for crashes or errors
- Monitor database query times

### Auto-Deploy on Push
Render automatically deploys when you push to `main` branch. To disable:
- Service Settings → Advanced → Uncheck "Auto-Deploy"

### Scale Up if Needed
- Free tier: 0.5 CPU, 512MB RAM
- Paid tiers: More CPU, RAM, 99.9% uptime SLA

---

## Quick Links

- Render Dashboard: https://dashboard.render.com
- Your Service Logs: https://dashboard.render.com/services/your-service-id
- Railway Dashboard: https://railway.app
- Vercel Dashboard: https://vercel.com/dashboard

---

**Need Help?**
- Render Docs: https://docs.render.com
- Check `/test-db` endpoint response for database-specific errors
- Monitor logs in real-time while testing

