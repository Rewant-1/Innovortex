# Railway Deployment Guide

## Monorepo Structure Fixed!

This repository now contains proper Railway configurations for both frontend and backend services.

### Frontend Service
- **Path**: `frontend/`
- **Type**: Next.js (Node.js)
- **Port**: 3000 (default Next.js port)
- **Config**: `frontend/railway.json` & `frontend/nixpacks.toml`

### Backend Service  
- **Path**: `backend/`
- **Type**: FastAPI (Python)
- **Port**: Uses Railway's $PORT environment variable
- **Config**: `backend/railway.json` & `backend/nixpacks.toml`

## Railway Deployment Steps

### Option 1: Deploy as Separate Services (Recommended)

1. **Create Backend Service**:
   - New Project → Deploy from GitHub
   - Select your `Rewant-1/Innovortex` repository
   - Set root directory to: `backend`
   - Railway will detect Python and use the nixpacks.toml config

2. **Create Frontend Service**:
   - In same project → Add Service → Deploy from GitHub
   - Select your `Rewant-1/Innovortex` repository 
   - Set root directory to: `frontend`
   - Railway will detect Node.js and use the nixpacks.toml config

3. **Set Environment Variables**:
   - **Backend Service**: Add your API keys (GOOGLE_API_KEY, etc.)
   - **Frontend Service**: 
     - `NEXT_PUBLIC_BACKEND_URL=https://your-backend-service.railway.app`

### Option 2: Let Railway Auto-detect (Alternative)

Railway should now auto-detect both services in your monorepo with the new configurations.

## Environment Variables Needed

### Backend (.env equivalent in Railway dashboard):
```
GOOGLE_API_KEY=your_google_api_key_here
CLIMATIQ_API_KEY=your_climatiq_api_key_here  
ORKES_API_KEY_ID=your_orkes_key_id_here
ORKES_API_KEY_SECRET=your_orkes_secret_here
```

### Frontend:
```
NEXT_PUBLIC_BACKEND_URL=https://your-backend-service.railway.app
```

## URLs after deployment:
- **Frontend**: `https://your-frontend-service.railway.app` 
- **Backend API**: `https://your-backend-service.railway.app`

The frontend will automatically connect to the backend using the environment variable!