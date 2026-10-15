# ⚡ Pulse — Self-Hosted Uptime Monitor & Status Page

<div align="center">

![Pulse Hero Banner](https://img.shields.io/badge/Pulse-Uptime%20Monitoring-2979ff?style=for-the-badge&logo=activity&logoColor=white)

**A high-performance, self-hosted infrastructure monitoring dashboard and public status page.**  
*Track endpoint latency, uptime degradation, and multi-channel alerts in real-time with zero SaaS fees.*

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-SQLite-2d3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

</div>

---

## ✨ Features

- 🟢 **Live Heartbeat Engine**: High-frequency HTTP polling with customizable intervals (30s, 60s, 5m, 10m) and 10s automatic timeout detection.
- 📊 **90-Day Uptime Heatbars**: Segmented daily availability bar with precision hover tooltips inspired by GitHub's contribution activity.
- 📈 **Interactive Response Time Graphs**: Real-time Recharts area graphs with gradient fills, average reference lines, and mini sparklines.
- 🚨 **Multi-Channel Outage Alerting**:
  - **Email Alerts**: HTML incident notifications dispatched via Gmail SMTP, custom SMTP, or Resend API.
  - **Discord Webhooks**: Rich color-coded embed alerts for instant downtime ping and operational recovery.
- 🌐 **Public Transparency Status Page**: Clean, shareable `/status` page displaying global system health and 30-day reliability metrics.
- 🎨 **Instagram-Grade Dark UI**: Deep `#0a0a0f` obsidian theme, glass-morphism cards, glowing pulse indicators, and ambient mesh gradient.
- 📁 **Zero-Config Self-Hosting**: File-backed SQLite database managed through Prisma ORM — no external database server required.

---

## 🏗️ Architecture

```
pulse/
├── prisma/
│   └── schema.prisma         # Indexed Monitor, Heartbeat & NotificationSettings models
├── src/
│   ├── app/
│   │   ├── layout.tsx        # Inter typography & dark theme setup
│   │   ├── page.tsx          # Real-time admin monitoring dashboard
│   │   ├── status/page.tsx   # Public shareable status page
│   │   └── api/
│   │       ├── monitors/     # Monitor creation, listing & statistical aggregation
│   │       ├── ping/         # State-transition check & concurrent polling
│   │       ├── heartbeat/    # Historical telemetry records
│   │       └── settings/     # Alert configurations & live test dispatch
│   ├── components/
│   │   ├── StatusBadge.tsx   # Pulsing operational indicator
│   │   ├── UptimeBar.tsx     # 90-day interactive timeline segments
│   │   ├── ResponseTimeChart # Smooth latency distribution curves
│   │   ├── MonitorCard.tsx   # Sparkline card with stagger animation
│   │   ├── AddMonitorModal   # Glass-morphism endpoint setup
│   │   └── NotificationSettingsModal # Email/Discord channel manager
│   └── lib/
│       ├── db.ts             # Prisma client singleton
│       ├── ping.ts           # Concurrent heartbeat runner
│       └── notifications.ts  # SMTP/Resend & Discord embed dispatcher
```

---

## 🚀 Quickstart

### 1. Clone the repository
```bash
git clone https://github.com/tejassachdeva2710/pulse.git
cd pulse
```

### 2. Install dependencies
```bash
npm install
```

### 3. Initialize the database
```bash
npx prisma db push
```

### 4. (Optional) Seed Starter Endpoints
```bash
npx tsx prisma/seed.ts
```

### 5. Launch Development Server
```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser to view your monitoring dashboard, or **[http://localhost:3000/status](http://localhost:3000/status)** for the public status page.

---

## 🔔 Configuring Alerts

When you open Pulse for the first time, the **Alerts & Notifications** modal will automatically prompt you for your setup:

### Email Notifications
- **Gmail SMTP (Free)**: Enter your Gmail address and a 16-letter [Google App Password](https://myaccount.google.com/apppasswords).
- **Resend API**: Enter a free API key from [resend.com](https://resend.com).
- **Custom SMTP**: Configure custom host, port, credentials, and TLS settings.

### Discord Webhooks
1. Open your Discord Server ➔ Channel Settings ➔ **Integrations** ➔ **Webhooks**.
2. Click **New Webhook**, copy the Webhook URL, and paste it into Pulse.
3. Click **"Send Test Alert"** to verify instantaneous delivery.

---

## 🛡️ License

Distributed under the MIT License. See `LICENSE` for more information.
