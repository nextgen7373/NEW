# TriVault Deployment Guide

## Current Configuration

- **Frontend URL**: https://new-chi-ashen.vercel.app/
- **Backend URL**: https://new-v6ms.onrender.com/
- **API Base URL**: https://new-v6ms.onrender.com/api

## Steps to Deploy

### 1. Backend Deployment (Render)

Your backend is configured to deploy automatically when you push to your repository. The configuration is in `render.yaml`.

**Important Environment Variables for Render:**
- `NODE_ENV=production`
- `PORT=10000`
- `MONGODB_URI=mongodb+srv://mrunalnextgen:EcsMvLAGhlQqbRov@cluster0.ust065y.mongodb.net/trivault?retryWrites=true&w=majority&appName=Cluster0`
- `FRONTEND_URL=https://new-chi-ashen.vercel.app`
- `JWT_SECRET` (auto-generated)
- `ENCRYPTION_KEY` (auto-generated)

### 2. Frontend Deployment (Vercel)

Your frontend is already deployed at https://new-chi-ashen.vercel.app/

**Environment Variables for Vercel:**
- `VITE_API_BASE_URL=https://new-v6ms.onrender.com/api`

### 3. Manual Deployment Commands

If you need to redeploy manually:

**Frontend (from client directory):**
```bash
cd client
vercel --prod
```

**Backend:** Push changes to your repository connected to Render.

### 4. Testing the Connection

Once both are deployed, test the health endpoint:
```bash
curl -X GET "https://new-v6ms.onrender.com/api/health"
```

Expected response:
```json
{"status":"OK","message":"TriVault API is running"}
```

### 5. Common Issues and Solutions

1. **CORS Errors**: Make sure the frontend URL is included in the CORS configuration
2. **Route not found**: Ensure the API base URL includes `/api` at the end
3. **Database connection**: Verify MongoDB URI is correct and accessible

### 6. Files Updated

- `client/.env` - Updated API base URL
- `server/middleware/cors.ts` - Added new frontend URL to allowed origins
- `server/.env` - Updated FRONTEND_URL
- `render.yaml` - Updated FRONTEND_URL for production deployment

## Quick Verification Checklist

- [ ] Frontend loads at https://new-chi-ashen.vercel.app/
- [ ] Backend health check responds at https://new-v6ms.onrender.com/api/health
- [ ] Login/register functionality works
- [ ] No CORS errors in browser console
- [ ] API calls are being made to correct backend URL
