# The Factory at Franklin, TN – Event Planner Platform

[![Astro](https://img.shields.io/badge/Astro-5.1-FF5D01?logo=astro&logoColor=white)](https://astro.build)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Sanity](https://img.shields.io/badge/Sanity-v3-F03E2F?logo=sanity&logoColor=white)](https://sanity.io/)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-Pages-FF6F00?logo=cloudflare&logoColor=white)](https://pages.cloudflare.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

> **Full‑stack event management platform** – book, manage, and track events with an edge‑deployed, serverless architecture.  
> Designed with a **Swiss‑industrial minimalist** aesthetic, subtle Apple‑inspired curves, and a warm, customizable color palette.

🔗 **Live Demo:** [the-factory-events.pages.dev](https://the-factory-events.pages.dev) *(replace with your actual Cloudflare URL)*

---

## Features

### Client Experience
- **Two‑step booking form** – client info + event details with estimated pricing.
- **Client dashboard** – view booking status, pay outstanding balances, and download invoices (coming soon).
- **Auto‑generated account numbers** for every booking.
- **Self‑service login** using booking # + email.

### Admin Back‑Office
- **Secure admin login** (password‑protected).
- **Admin dashboard** with real‑time stats:
  - Revenue, total bookings, upcoming events, QR scan counts.
  - Revenue by month (bar chart) and booking status (pie chart).
- **Booking management** – search, filter, edit, and delete bookings.
- **Interactive calendar** – monthly view with event indicators.
- **Bills & payments** – track outstanding balances and record payments.
- **Client customisation** – brand colors, fonts, and logo can be updated via Sanity settings.

### Design Language
- **Swiss‑industrial minimalism** – clean grids, generous white space, functional typography.
- **Subtle curves** (`rounded-lg` / `rounded-md`) – Apple‑inspired refinement without over‑rounding.
- **Warm palette** – Carmine, Cardinal, Chamois, Sepia, and Dark Brown.
- **Built‑in dark mode** and **high‑contrast** support for accessibility.

### Architecture & Technology
- **Astro 5** – islands architecture; only the interactive parts (charts, forms) are hydrated.
- **React 19** – for interactive UI components.
- **Sanity v3** – headless CMS for bookings, settings, subscribers, and waitlist.
- **Cloudflare D1** – transactional data (payments, analytics, QR scans, email logs).
- **Cloudflare Pages** – serverless deployment at the edge.
- **Cloudflare Workers** – for cron jobs and serverless API endpoints.
- **Tailwind CSS 4** – utility‑first styling with the Vite plugin.
- **TypeScript** – full type safety.

---

## Screenshots

*(Add your screenshots here – e.g., dashboard, booking form, calendar)*

| Admin Dashboard | Booking Form |
| :---: | :---: |
| *[Screenshot of dashboard]* | *[Screenshot of booking form]* |

---

## Tech Stack at a Glance

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Astro 5 + React 19 |
| **Styling** | Tailwind CSS 4 + Inter font |
| **CMS** | Sanity v3 |
| **Database** | Cloudflare D1 (SQLite) |
| **Hosting** | Cloudflare Pages |
| **Serverless** | Cloudflare Workers |
| **Payments** | Stripe (mock mode ready) |
| **Emails** | Resend |
| **Icons** | Lucide React |

---

## Getting Started (Local Development)

### Prerequisites
- Node.js 22+
- A Sanity account (free tier)
- A Cloudflare account (free tier)

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/the-factory-events.git
cd the-factory-events