# 🏛️ The Factory at Franklin, TN – Venue Operations

[![Astro](https://img.shields.io/badge/Astro-5.1-FF5D01?logo=astro&logoColor=white)](https://astro.build)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Sanity](https://img.shields.io/badge/Sanity-v3-F03E2F?logo=sanity&logoColor=white)](https://sanity.io/)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-Pages-FF6F00?logo=cloudflare&logoColor=white)](https://pages.cloudflare.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

> **Full‑stack venue operations platform** – book, manage, and track  with an edge‑deployed, serverless architecture.   
> Designed with a **Swiss‑industrial minimalist** aesthetic, subtle Apple‑inspired curves, and a warm, customizable color palette.

🔗 **Live Demo:** [the-factory-events.pages.dev](https://the-factory-events.pages.dev) *(replace with your actual Cloudflare URL)*

---

## Features

### Client Experience

* **Space reservation** – Reserve venues, meeting rooms, ballrooms, covered booths, open-air booths, vendor spaces, and other rental locations.
* **Two-step reservation form** – Client information + reservation details with estimated pricing.
* **Client portal** – View reservation status, upcoming bookings, invoices, and payment history *(coming soon)*.
* **Auto-generated reservation IDs** for every booking.
* **Self-service login** using reservation ID + email.

### Venue Operations

* **Secure admin authentication** for venue staff.
* **Operations dashboard** with real-time insights:

  * Revenue, reservations, occupancy, upcoming rentals, and QR scan analytics.
  * Monthly revenue (bar chart) and reservation status (pie chart).
* **Reservation management** – Create, search, filter, edit, cancel, and manage reservations.
* **Venue management** – Configure venues, rooms, vendor spaces, booths, and rental locations.
* **Availability calendar** – Interactive monthly calendar with reservation indicators.
* **Billing & payments** – Generate invoices, track balances, and record payments.
* **Client customization** – Update brand colors, typography, and logo through Sanity settings.

### Design System

* **Swiss-industrial minimalism** – Clean layouts, structured grids, and functional typography.
* **Accessible interface** – Built for administrators, venue staff, and clients with usability as the priority.
* **Refined UI** – Subtle rounded corners (`rounded-md` / `rounded-lg`) inspired by Apple's design language.
* **Warm color palette** – Carmine, Cardinal, Chamois, Sepia, and Dark Brown.
* **Built-in dark mode** and **high-contrast accessibility** support.

### Architecture & Technology

* **Astro 5** – Islands architecture that hydrates only interactive components.
* **React 19** – Interactive dashboards, forms, and management tools.
* **Sanity v3** – Headless CMS for venue content, settings, clients, and reservations.
* **Cloudflare D1** – Stores reservations, payments, analytics, QR scans, and activity logs.
* **Cloudflare Pages** – Global edge deployment.
* **Cloudflare Workers** – Serverless APIs, scheduled jobs, and background tasks.
* **Tailwind CSS 4** – Utility-first styling powered by Vite.
* **TypeScript** – End-to-end type safety.

---

## Tech Stack

| Layer          | Technology                       |
| :------------- | :------------------------------- |
| **Frontend**   | Astro 5 + React 19               |
| **Styling**    | Tailwind CSS 4 + Inter           |
| **CMS**        | Sanity v3                        |
| **Database**   | Cloudflare D1 (SQLite)           |
| **Hosting**    | Cloudflare Pages                 |
| **Serverless** | Cloudflare Workers               |
| **Payments**   | Stripe *(ready for integration)* |
| **Emails**     | Resend                           |
| **Icons**      | Lucide React                     |

---

## 🚀 Getting Started

### Prerequisites

* Node.js 22+
* Sanity account (Free)
* Cloudflare account (Free)

### Clone the repository

```bash ??? fix later
git clone https://github.com/DeafGecko/the-factory-events.git
cd the-factory-events
```
