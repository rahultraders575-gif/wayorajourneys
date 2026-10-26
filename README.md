# Wayora Journeys - Red Edition

Premier luxury chauffeur and outstation car rental web application with an integrated production Node.js/Express backend server, interactive booking flows, route radar planning, and server-side Gemini AI concierge.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v20+ recommended)
- npm (v10+)

### 1. Installation
```bash
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Set your environment variables:
- `PORT` (defaults to `3000`)
- `GEMINI_API_KEY` (optional, for server-side AI concierge)

### 3. Local Development (Vite Dev Server)
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Production Build & Deployment

### Standard Node.js Production Run
```bash
# 1. Typecheck
npm run lint

# 2. Build production client bundle & server executable
npm run build

# 3. Start production server
npm start
```
The server will bind to `0.0.0.0:3000` (or your configured `PORT`), serving optimized static assets and API routes.

---

## 🐳 Docker Deployment

A multi-stage production Dockerfile is included:

```bash
# Build Docker image
docker build -t wayora-journeys:latest .

# Run container
docker run -d -p 3000:3000 --name wayora-app wayora-journeys:latest
```

Health check is automatically pre-configured:
```bash
wget -qO- http://localhost:3000/api/health
```

---

## 🌐 Backend API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health probe (service status, memory, uptime) |
| `POST` | `/api/bookings` | Dispatch new chauffeur booking request |
| `POST` | `/api/contact` | Customer inquiries and corporate fleet requests |
| `POST` | `/api/ai/concierge` | Server-side Gemini AI travel assistant |
| `GET` | `/*` | Single Page Application (SPA) routing fallback to `index.html` |

---

## ☁️ Cloud Platform Deployments

- **Google Cloud Run:** Direct deployment using source or Dockerfile. Automatically injects `PORT=8080`.
- **Render / Railway / Fly.io:** Pre-configured with `npm run build` and `npm start`.
- **Vercel / Netlify:** Pre-configured with [`vercel.json`](vercel.json) for client-side SPA routing.
