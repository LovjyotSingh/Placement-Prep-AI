# PlacementPrep AI

PlacementPrep AI is an interview readiness platform for campus placement preparation. It combines AI-generated mock interviews, instant response feedback, resume analysis, and dashboard analytics in one full-stack application.

## Features

- AI-powered mock interviews by role and difficulty
- Response evaluation for technical correctness, clarity, and confidence
- Resume analyzer with ATS score, missing keywords, strengths, and improvements
- Dashboard with score trends, skill radar, and recent interview history
- Session-based authentication with protected routes
- Production-ready deployment setup for Vercel and Render

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Recharts, lucide-react
- Backend: Node.js, Express, Mongoose, JWT, Multer
- Database: MongoDB Atlas
- AI: OpenRouter-compatible AI provider
- Deployment: Vercel frontend, Render backend

## Project Structure

```text
project/
  backend/       Express API, MongoDB models, auth, interview and resume logic
  frontend/      React/Vite client application
  render.yaml    Render backend deployment blueprint
  DEPLOYMENT.md  Step-by-step deployment guide
```

## Local Setup

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Set the real values in `backend/.env`.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

For local development:

```text
VITE_API_URL=http://localhost:5000/api
```

## Environment Variables

Backend:

```text
NODE_ENV=production
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=replace_with_a_long_random_secret
AI_PROVIDER=openrouter
AI_API_KEY=your_ai_provider_api_key
AI_MODEL=openai/gpt-4o-mini
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

Frontend:

```text
VITE_API_URL=https://your-backend-domain.onrender.com/api
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the full deployment checklist.

Recommended setup:

- Backend: Render web service using `render.yaml`
- Frontend: Vercel static deployment from `frontend`
- Database: MongoDB Atlas

## Security Notes

Do not commit real `.env` files. Rotate any exposed credentials before deploying, especially:

- MongoDB Atlas password
- AI API key
- JWT secrets

Use long random values for production secrets.

## Build Verification

```bash
cd frontend
npm run build
```

```bash
node --check backend/server.js
```
