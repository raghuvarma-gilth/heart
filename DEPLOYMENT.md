# 🫀 CardioMind - Deployment Guide

## AI-Powered Heart Health Platform

---

## 📁 Project Structure

```
HeartGuard/
├── heart.csv                    # Training dataset
├── backend/
│   ├── app.py                   # Flask API server
│   ├── train.py                 # ML training pipeline
│   ├── requirements.txt         # Python dependencies
│   ├── Procfile                 # Render deployment
│   ├── .env                     # Environment variables
│   ├── .gitignore
│   └── model/
│       ├── model.pkl            # Trained ensemble model
│       ├── scaler.pkl           # Feature scaler
│       └── metadata.json        # Model metadata
├── frontend/
│   ├── package.json
│   ├── next.config.ts
│   ├── tsconfig.json
│   ├── postcss.config.mjs
│   ├── .env.local               # Frontend env vars
│   ├── .env.local.example
│   ├── .gitignore
│   └── src/
│       ├── app/
│       │   ├── layout.tsx       # Root layout
│       │   ├── page.tsx         # Landing page
│       │   ├── globals.css      # Design system
│       │   ├── login/page.tsx
│       │   ├── signup/page.tsx
│       │   ├── dashboard/
│       │   │   ├── layout.tsx   # Dashboard sidebar layout
│       │   │   ├── page.tsx     # Dashboard overview
│       │   │   ├── predict/page.tsx
│       │   │   ├── stress/page.tsx
│       │   │   ├── symptoms/page.tsx

│       │   │   ├── appointments/page.tsx
│       │   │   └── chat/page.tsx
│       │   └── admin/
│       │       ├── layout.tsx   # Admin sidebar layout
│       │       ├── page.tsx     # Admin overview
│       │       ├── appointments/page.tsx
│       │       ├── users/page.tsx
│       │       └── analytics/page.tsx
│       ├── context/
│       │   ├── AuthContext.tsx
│       │   └── ThemeContext.tsx
│       └── lib/
│           ├── firebase.ts
│           └── api.ts
```

---

## 🚀 Local Development

### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python train.py          # Train the ML model
python app.py            # Start Flask server (port 5000)
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev              # Start Next.js dev server (port 3000)
```

### 3. Environment Variables

**Backend (`backend/.env`):**
```
GROK_API_KEY=your_grok_api_key_here
FLASK_DEBUG=true
PORT=5000
```

**Frontend (`frontend/.env.local`):**
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_API_URL=http://localhost:5000

```

---

## ☁️ Deployment

### Backend → Render

1. Push `backend/` to a GitHub repo
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Create a **New Web Service**
4. Connect your GitHub repo
5. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120`
   - **Environment**: Python 3
6. Add environment variable: `GROK_API_KEY`
7. Deploy!

### Frontend → Vercel

1. Push `frontend/` to a GitHub repo
2. Go to [Vercel Dashboard](https://vercel.com)
3. Import your GitHub repo
4. Settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Next.js
5. Add all `NEXT_PUBLIC_*` environment variables
6. Update `NEXT_PUBLIC_API_URL` to your Render backend URL
7. Deploy!

### Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable **Authentication** → Email/Password
4. Enable **Cloud Firestore**
5. Create Firestore indexes:
   - Collection: `appointments`, Fields: `userId` (Asc), `createdAt` (Desc)
6. Copy Firebase config to your `.env.local`

---

## 🔑 API Keys Required

| Key | Provider | Used For |
|-----|----------|----------|
| `GROK_API_KEY` | [x.ai](https://x.ai) | Backend AI reasoning, chatbot, symptom analysis |
| Firebase Config | [Firebase Console](https://console.firebase.google.com) | Auth + Database |

---

## 🧠 AI Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│   Backend    │────▶│   Grok API   │
│  (Next.js)   │     │   (Flask)    │     │  (Reasoning)  │
│              │     │              │     └──────────────┘
│              │     │  ML Model    │
│              │     │  (Predict)   │
└──────────────┘     └──────────────┘
```

- **Grok API** → Backend → All reasoning, analysis, chatbot
- **ML Model** → Backend → Heart disease prediction (95%+ accuracy)

---

## 🔒 Security Notes

- All API keys are in environment variables (never hardcoded)
- Firebase Authentication for user management
- Role-based access control (patient vs admin)
- Protected routes redirect unauthenticated users
- Input validation on all API endpoints
- CORS configured for production domains

---

## 📊 ML Model Details

- **Algorithm**: Voting Ensemble (RandomForest + GradientBoosting)
- **Features**: 13 original + 8 engineered = 21 total
- **Dataset**: 1026 rows → augmented to ~2500
- **Accuracy**: 95%+ (cross-validated)
- **Training**: Run `python train.py` to retrain
