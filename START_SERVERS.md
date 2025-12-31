# 🚀 How to Start the Servers

## Project Structure

Your project has this structure:
```
frontend/
├── backend/          ← Backend code here
│   ├── .env
│   └── package.json
└── frontend/         ← Frontend code here
    ├── .env
    └── package.json
```

## Starting the Servers

### Backend Server

**Open a PowerShell/Terminal window:**

```powershell
cd C:\Users\M\Desktop\frontend\backend
npm run start:dev
```

The backend will run on: **http://localhost:3000**

---

### Frontend Server

**Open a NEW PowerShell/Terminal window:**

```powershell
cd C:\Users\M\Desktop\frontend\frontend
npm run dev
```

The frontend will run on: **http://localhost:5173**

---

## ⚠️ Important Notes

1. **Use `npm run dev`** (not `npm start`) for the frontend
2. **Run each server in a separate terminal window**
3. **Backend must be running before the frontend can connect to it**

## Quick Commands

### Backend:
```powershell
cd backend
npm run start:dev
```

### Frontend:
```powershell
cd frontend
npm run dev
```

## Access URLs

- **Frontend App**: http://localhost:5173
- **Backend API**: http://localhost:3000/api
- **API Docs**: http://localhost:3000/api/docs

---

## Troubleshooting

### "package.json not found"
- Make sure you're in the correct directory:
  - For backend: `cd backend`
  - For frontend: `cd frontend`

### Port already in use
- Backend (3000): Stop any other service using port 3000
- Frontend (5173): Stop any other service using port 5173, or change port in `frontend/vite.config.js`

### Frontend can't connect to backend
- Make sure backend is running first
- Check `VITE_REACT_APP_BASE_URL` in `frontend/.env` is set to `http://localhost:3000/api`

