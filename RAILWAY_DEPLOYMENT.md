# Railway Deployment Guide

## Quick Setup

### 1. Configure Railway Environment Variables

In your Railway project dashboard, add the following environment variables:

```env
PORT=3001
FRONTEND_URL=https://your-frontend-url.netlify.app
SUPABASE_URL=https://aobojqwdflxpbojykuis.supabase.co
SUPABASE_ANON_KEY=sb_publishable_cQ8b1Rmh5cdPkFe7hCDopg_FlD5T03I
```

**Note:** Replace `FRONTEND_URL` with your actual Netlify URL once deployed.

### 2. Deploy

The `railway.json` configuration is set up to:
- Build from the root directory
- Install dependencies from the `backend` folder
- Start the server from the `backend` folder

Railway will automatically:
1. Detect the `railway.json` configuration
2. Run `cd backend && npm install` during build
3. Run `cd backend && npm start` to start the server
4. Expose the service on the PORT environment variable

### 3. After Deployment

1. Copy your Railway backend URL (e.g., `https://your-app.railway.app`)
2. Update your Netlify frontend environment variable:
   ```
   VITE_BACKEND_URL=https://your-app.railway.app
   ```
3. Update Railway's `FRONTEND_URL` to match your Netlify URL for CORS

## Troubleshooting

### Build Fails
- Check that `railway.json` is in the root directory
- Verify all environment variables are set
- Check Railway build logs for specific errors

### Server Crashes on Start
- Verify Supabase credentials are correct
- Check that the database table exists (run `database/schema.sql`)
- Review Railway deployment logs

### Connection Issues
- Ensure CORS is configured with correct `FRONTEND_URL`
- Verify WebSocket connections are allowed (Railway supports them by default)
- Check that the PORT variable is not hardcoded

## Environment Variables Reference

| Variable | Example | Description |
|----------|---------|-------------|
| PORT | 3001 | Server port (Railway sets automatically) |
| FRONTEND_URL | https://app.netlify.app | Frontend URL for CORS |
| SUPABASE_URL | https://xxx.supabase.co | Supabase project URL |
| SUPABASE_ANON_KEY | eyJhbG... | Supabase anonymous/public key |

## Files Changed for Railway

- `railway.json` - Moved to root and updated build/start commands
- This ensures Railway builds and runs the backend correctly
