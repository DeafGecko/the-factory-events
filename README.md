# The Factory at Franklin, TN – Venue Operations

[![Astro](https://img.shields.io/badge/Astro-4-FF5D01?logo=astro&logoColor=white)](https://astro.build)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Sanity](https://img.shields.io/badge/Sanity-v3-F03E2F?logo=sanity&logoColor=white)](https://sanity.io/)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers-FF6F00?logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

> Full-stack venue operations platform — book, manage, and track with an edge-deployed, serverless architecture.

**Live:** [venue-operations-api.dwirog.workers.dev](https://venue-operations-api.dwirog.workers.dev)

---

## Features

### Admin Panel
- **Secure login** — email + password with role-based access (Admin, Manager, Developer, Viewer)
- **Dashboard** — revenue, reservations, occupancy, and QR scan analytics
- **Bookings** — create, search, filter, edit, and manage reservations
- **Calendar** — interactive monthly view with reservation indicators
- **Bills & Payments** — generate invoices, track balances, record payments
- **Spaces** — configure venues, rooms, vendor spaces, and booths
- **Clients, Vendors, Tenants** — manage all contacts in one place
- **QR Scans** — track check-ins and access logs
- **Login Management** — invite users, assign roles, reset passwords, block accounts
- **Settings** — brand colors, logo, typography — all configurable via Sanity

### Architecture
- **Astro 4** — islands architecture, server-side rendered
- **React 19** — interactive dashboards, forms, and tables
- **Sanity v3** — headless CMS for all content and settings
- **Cloudflare Workers** — global edge deployment, serverless APIs
- **Cloudflare D1** — SQLite database for reservations and analytics
- **Tailwind CSS 4** — utility-first styling
- **Resend** — transactional email (invites, password resets)
- **TypeScript** — end-to-end type safety

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| Frontend | Astro 4 + React 19 |
| Styling | Tailwind CSS 4 + Inter |
| CMS | Sanity v3 |
| Database | Cloudflare D1 (SQLite) |
| Hosting | Cloudflare Workers |
| Emails | Resend |
| Icons | Lucide React |

---

## Getting Started

### Prerequisites
- Node.js 22+
- Sanity account (free)
- Cloudflare account (free)
- Resend account (free) — for invite/password reset emails

### Clone & Install

```bash
git clone https://github.com/DeafGecko/venue-operations.git
cd venue-operations
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
SANITY_PROJECT_ID=your_project_id
SANITY_DATASET=production
SANITY_API_TOKEN=your_sanity_token
SUPER_ADMIN_EMAIL=you@yourdomain.com
ADMIN_PASSWORD=your_secure_password
RESEND_API_KEY=re_your_resend_key
FROM_EMAIL=noreply@yourdomain.com
PUBLIC_BASE_URL=http://localhost:4321
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:4321/admin/login](http://localhost:4321/admin/login)

### Deploy to Cloudflare

Upload secrets (one-time setup):

```bash
npx wrangler secret put SANITY_API_TOKEN
npx wrangler secret put SUPER_ADMIN_EMAIL
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put RESEND_API_KEY
```

Then deploy:

```bash
npm run build && node -e "
const fs=require('fs');
const f='dist/_worker.js/chunks/'+fs.readdirSync('dist/_worker.js/chunks').find(f=>f.includes('astro-renderers'));
fs.writeFileSync(f,fs.readFileSync(f,'utf8').replace('var channel = new MessageChannel(),','if(typeof MessageChannel===\"undefined\"){globalThis.MessageChannel=class{constructor(){this.port1={onmessage:null};this.port2={postMessage:(d)=>{if(this.port1.onmessage)setTimeout(()=>this.port1.onmessage({data:d}),0)}}}}}var channel = new MessageChannel(),'));
" && echo "_worker.js" > dist/.assetsignore && npx wrangler deploy
```

---

## Role Access

| Role | View | Edit | Login Management |
| :--- | :---: | :---: | :---: |
| Admin | ✅ | ✅ | ✅ |
| Manager | ✅ | ✅ | ❌ |
| Developer | ✅ | ❌ | ❌ |
| Viewer | ✅ | ❌ | ❌ |

---

## License

Private — The Factory at Franklin, TN. All rights reserved.
