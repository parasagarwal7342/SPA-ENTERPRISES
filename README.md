# 🚀 SPA Enterprise — Official Distribution Platform

> A high-performance, three-portal enterprise e-commerce platform for **SPA Enterprises, Delhi** — Official distributor of National Geographic and Shraddha Arts & Jewels.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/spa-enterprise)

---

## 🌐 Live Portals
- **Customer Portal**: `https://spaenterprise.in`
- **Staff Management**: `/#seller` (password-protected)
- **Owner Analytics**: `/#owner` (password-protected)

---

## ⚡ Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- npm 9+

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/spa-enterprise.git
cd spa-enterprise
```

### 2. Install dependencies
```bash
# Frontend
npm install

# Backend
cd server && npm install
```

### 3. Configure environment
```bash
cp server/.env.example server/.env
# Edit server/.env and fill in your API keys
```

### 4. Start development servers
```bash
# Terminal 1 — Frontend
npm run dev

# Terminal 2 — Backend
cd server && npm run dev
```

### 5. Open in browser
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

---

## 🔐 Default Login Credentials

| Portal | Email | Password |
|--------|-------|----------|
| Staff Login | staff@spa.com | 123456 |
| Owner Login | owner@spa.com | 123456 |

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite + Tailwind CSS |
| Backend | Fastify + TypeScript |
| Database | JSON Registry (dev) → PostgreSQL (prod) |
| Payments | Razorpay |
| AI | Anthropic Claude + OpenAI DALL·E 3 |
| Social Media | Meta Graph API + LinkedIn API |
| Deployment | Vercel + Railway |

---

## 🚀 Production Deployment

### Frontend → Vercel
1. Push to GitHub
2. Import repo at [vercel.com](https://vercel.com)
3. Set `VITE_RAZORPAY_KEY_ID` in Vercel environment variables
4. Deploy!

### Backend → Railway
1. Create account at [railway.app](https://railway.app)
2. Connect GitHub repo
3. Set all `.env` variables in Railway dashboard
4. Deploy `server/` directory

---

## 💰 Running Costs
- **Development**: ₹0 (all free tiers)
- **Low Traffic (1k–10k users/month)**: ~₹420/month
- **Medium Traffic (10k–50k)**: ~₹15,000–20,000/month

---

## 📞 Contact
- Email: spaenterprisesdelhi@gmail.com
- Phone: +91 9650045621
- Address: Rohini Sector-39, Delhi-110081

---

*© 2026 SPA Enterprise Core Distribution. All rights reserved.*
