# 📈 Signalist – Market Watch & Alerts

Next.js app-router project for tracking stocks, personalized watchlists, AI‑assisted emails, and auth with Better Auth + MongoDB.

---

## 🧭 Overview
- 🔐 Auth: email/password via Better Auth (MongoDB adapter, server cookies)
- 📊 Market data: Finnhub search/news, TradingView embeds
- ⭐ Watchlist: add/remove stocks, price/change cards, daily news email
- ✉️ Email: Nodemailer for welcome + news summaries

### High-level flow (text diagram)
```
[Client UI] --(actions)--> [Next server routes + Better Auth]
       \                  -> MongoDB (users, watchlist)
        \                 -> Finnhub API (quotes/news)
         \                -> Nodemailer (welcome/news emails)
```

---

## 🚀 Quick start
```bash
npm install
npm run dev
# visit http://localhost:3000
```

### Required environment (.env.local / Vercel)
```
MONGODB_URI=...
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=http://localhost:3000            # Vercel: https://your-app.vercel.app
FINNHUB_API_KEY=...                              # or NEXT_PUBLIC_FINNHUB_API_KEY
NODEMAILER_EMAIL=...
NODEMAILER_PASSWORD=...
```

---

## 📂 Project structure (top-level)
```
market_app/
├─ app/                 # Next.js app router (auth, watchlist, stocks)
├─ components/          # UI + domain components (Header, WatchlistGrid, etc.)
├─ database/            # Mongoose connection + models
├─ lib/                 # actions (server), utils, auth, prompts
├─ public/              # static assets (icons, images)
├─ types/               # global TS types
├─ scripts/             # helper scripts
└─ middleware.ts        # auth/session middleware
```

---

## 🧩 Key pieces
- `lib/better-auth/auth.ts` — Better Auth setup (MongoDB adapter, cookies)
- `lib/actions/watchlist.actions.ts` — add/remove/list/quote watchlist items
- `app/(root)/watchlist/page.tsx` — watchlist cards with price/change + removal
- `components/WatchlistButton.tsx` — client toggle wired to server actions + toasts
- `lib/actions/auth.actions.ts` — sign-in/up/out wrappers for pages

---

## 📜 Scripts
- `npm run dev` – start dev server
- `npm run build` – production build
- `npm run start` – start production server
- `npm run lint` – lint

---

## 🛠️ Deployment notes
- Set env vars in Vercel: `MONGODB_URI`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `FINNHUB_API_KEY`, `NODEMAILER_*`.
- Ensure MongoDB driver version aligns with Better Auth (`mongodb@^6.18.x`).
- If using a custom domain for emails, configure SMTP accordingly; otherwise Gmail via `NODEMAILER_EMAIL/PASSWORD`.

---

## 🔍 Status & diagnostics
- Check server logs for Better Auth errors (e.g., BSON version, invalid ids).
- Browser toasts show API error messages returned from server actions.
- Atlas: clear legacy `user` docs if they were created with incompatible ids.
