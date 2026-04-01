# BeeBot Frontend — React SPA

The BeeBot frontend is a React 18 + Vite single-page application that hosts the dashboard, onboarding flow, landing page, and the public `widget.js` file that end-clients embed on their websites.

**Live URL:** https://beebot-ai.vercel.app

---

## Pages & Their Roles

| Page / Component         | Route               | Purpose                                                   |
|--------------------------|---------------------|-----------------------------------------------------------|
| `LandingPage.jsx`        | `/`                 | Public marketing page — hero, features, how it works, CTA |
| `Auth.jsx`               | `/auth`             | Login and registration (email/password + Google OAuth)    |
| `Onboarding.jsx`         | `/onboarding`       | 4-step wizard: business → bot → knowledge → embed         |
| `Dashboard.jsx`          | `/dashboard`        | Main dashboard shell with sidebar navigation              |
| `OverviewTab.jsx`        | `/dashboard`        | Stats overview — conversations, messages, knowledge sources|
| `KnowledgeTab.jsx`       | `/dashboard/knowledge` | Upload/manage knowledge sources (files and URLs)       |
| `BotSettingsTab.jsx`     | `/dashboard/settings`  | Configure bot name, tone, color picker, starters       |
| `ConversationsTab.jsx`   | `/dashboard/conversations` | Browse and read all visitor conversations          |
| `PlaygroundTab.jsx`      | `/dashboard/playground`  | Live split-panel chat sandbox for testing the bot      |
| `InstallTab.jsx`         | `/dashboard/install`    | Installation guide with platform-specific steps        |
| `BillingTab.jsx`         | `/dashboard/billing`    | Subscription and billing management                   |
| `ProfileTab.jsx`         | `/dashboard/profile`    | Account and profile settings                          |

---

## Widget Hosting

`/public/widget.js` is served as a **static file** by Vercel at `https://beebot-ai.vercel.app/widget.js`.

End-clients embed it with:
```html
<script
  src="https://beebot-ai.vercel.app/widget.js"
  data-api-key="YOUR_API_KEY"
  data-api-url="https://beebot-backend.onrender.com"
  defer>
</script>
```

On every page load, `widget.js` calls `GET /api/chat/config` to fetch the latest bot config (name, color, welcome message, starters) fresh — no localStorage caching of config. This means any change in the dashboard is reflected on client websites instantly on next page reload.

---

## Environment Variables

| Variable              | Description                                           |
|-----------------------|-------------------------------------------------------|
| `VITE_API_BASE_URL`   | Backend API base URL (e.g. https://beebot-backend.onrender.com/api) |
| `VITE_WIDGET_URL`     | Full URL to widget.js (e.g. https://beebot-ai.vercel.app/widget.js) |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID for social login             |

---

## Local Setup

```bash
# 1. Install dependencies
cd frontend
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your values

# 3. Start development server
npm run dev
```

The app starts at `http://localhost:5173`.

---

## Build & Deploy on Vercel

```bash
# Build for production
npm run build
```

Deploy by connecting the `frontend/` directory to a Vercel project. Vercel auto-deploys on every push to `main`.

A `vercel.json` is included to fix SPA routing (React Router 404 on page refresh):
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```
