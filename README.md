<div align="center">

# CardScan Pro

### AI-Powered Business Card Scanner & Lead Pipeline

**Turn business cards into actionable leads in seconds.**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D2D2D?logo=prisma)](https://www.prisma.io)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?logo=tailwindcss)](https://tailwindcss.com)

[Live Demo](#) • [Report Bug](#) • [Request Feature](#)

</div>

---

## What is CardScan Pro?

CardScan Pro is a full-stack web application that uses **Google Gemini AI** to extract contact information from business card photos. Users can scan cards via upload or camera capture, review and edit extracted data, then manage leads through a visual pipeline dashboard.

Built as a **production-grade SaaS MVP** — not a tutorial project.

---

## Key Features

| Feature | Description |
|---------|-------------|
| **AI Card Scanning** | Upload or photograph a business card → Gemini 2.0 Flash extracts name, title, company, emails, phones, websites, and address |
| **Smart Lead Pipeline** | Track leads through stages: New → Contacted → Qualified → Converted / Lost |
| **Full CRUD Operations** | Create, read, update, delete leads with inline editing and search |
| **Dashboard Analytics** | Real-time stats — total leads, conversion rate, scan usage, pipeline breakdown, recent activity |
| **Authentication** | Email/password registration with auto-login, JWT sessions, Google OAuth (optional) |
| **Subscription Quota** | Monthly scan tracking with free tier (5 scans/month), ready for paid plan integration |
| **Waitlist System** | Email capture with duplicate detection, stored in database |
| **CSV Export** | One-click export of all leads to CSV |
| **Responsive Design** | Mobile-first with camera capture support, hamburger nav, adaptive layouts |
| **Animated Landing Page** | 9-section marketing page with Framer Motion scroll animations |

---

## Tech Stack

```
Frontend:   Next.js 15 (App Router) • React 19 • TypeScript • Tailwind CSS v4
UI:         shadcn/ui (Base UI primitives) • Framer Motion • Lucide Icons
Backend:    Next.js Server Actions • Prisma ORM • SQLite (dev) / PostgreSQL (prod)
Auth:       NextAuth v5 (Credentials + Google OAuth) • JWT Strategy • bcryptjs
AI:         Google Gemini 2.0 Flash (@google/generative-ai) • Zod v4 validation
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT (React)                       │
│  Landing Page  │  Dashboard  │  Scan  │  Leads  │  Auth │
└────────────────────────┬────────────────────────────────┘
                         │ Server Actions
┌────────────────────────▼────────────────────────────────┐
│                    SERVER (Next.js)                       │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────┐    │
│  │  Auth     │  │  Lead    │  │  Scan Service       │    │
│  │  Actions  │  │  Service │  │  ├─ Quota Check     │    │
│  │          │  │          │  │  ├─ Gemini AI Call   │    │
│  │          │  │          │  │  └─ Usage Increment  │    │
│  └────┬─────┘  └────┬─────┘  └────────┬───────────┘    │
│       │              │                  │                │
│  ┌────▼──────────────▼──────────────────▼───────────┐   │
│  │              Prisma ORM  →  SQLite                │   │
│  │  User • Lead • Plan • Subscription • ScanUsage    │   │
│  └───────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## How It Works

### Card Scanning Flow

```
1. User uploads / photographs a business card
         ↓
2. Client-side image compression (max 1600px, 85% quality)
         ↓
3. Server action: auth check → quota check → Gemini AI extraction
         ↓
4. AI returns structured JSON: { name, designation, company, emails, phones, ... }
         ↓
5. User reviews & edits extracted data in a form
         ↓
6. Save → stored as a Lead in the database
```

### Data Extraction Example

**Input:** Business card photo
**Output:**
```json
{
  "name": "Sarah Chen",
  "designation": "VP of Sales",
  "company": "Vertex Inc.",
  "emails": ["sarah@vertex.com"],
  "phones": ["+1-555-0123"],
  "websites": ["https://vertex.com"],
  "address": "123 Market St, San Francisco, CA 94105"
}
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- A [Google Gemini API key](https://aistudio.google.com/apikey)

### Installation

```bash
# Clone the repository
git clone https://github.com/amitmishra-20/card-scanner.git
cd card-scanner

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your values (see below)

# Initialize the database
npx prisma db push

# Seed the free plan
npx prisma db seed

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

```env
# Required
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
DATABASE_URL="file:./dev.db"
GEMINI_API_KEY="your-gemini-api-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional — enables Google OAuth sign-in
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

---

## Project Structure

```
card-scanner/
├── app/
│   ├── page.tsx                          # Landing page (9 animated sections)
│   ├── login/page.tsx                    # Email/password login
│   ├── register/page.tsx                 # Registration with auto-login
│   ├── (app)/
│   │   ├── layout.tsx                    # App shell (sidebar + topbar)
│   │   ├── dashboard/page.tsx            # Analytics dashboard
│   │   ├── scan/page.tsx                 # Card scanner with AI extraction
│   │   ├── leads/page.tsx                # Lead pipeline with CRUD
│   │   └── account/page.tsx              # Profile settings
│   └── api/auth/[...nextauth]/route.ts   # NextAuth API handler
├── actions/                              # Server actions (API layer)
│   ├── user.ts                           # Auth, profile, account management
│   ├── leads.ts                          # Lead CRUD + dashboard data
│   ├── scan.ts                           # AI extraction + quota
│   └── waitlist.ts                       # Waitlist email capture
├── services/                             # Business logic layer
│   ├── lead.service.ts                   # Lead operations + dashboard stats
│   ├── subscription.service.ts           # Plans, subscriptions, usage
│   └── scan.service.ts                   # Quota enforcement + Gemini wrapper
├── lib/
│   ├── auth.ts                           # NextAuth v5 configuration
│   ├── db.ts                             # Prisma client singleton
│   ├── gemini.ts                         # Gemini AI integration
│   └── validations.ts                    # Zod schemas (shared client/server)
├── components/
│   ├── landing/                          # 9 animated landing page sections
│   ├── layout/                           # Sidebar, topbar
│   └── ui/                               # shadcn/ui component library
├── prisma/
│   └── schema.prisma                     # Database schema (7 models)
├── constants/                            # App config, status colors, prompts
└── types/                                # TypeScript interfaces
```

---

## Database Schema

```prisma
User          →  Lead[]            (one-to-many)
User          →  Subscription?     (one-to-one)
User          →  ScanUsage[]       (one-to-many)
Subscription  →  Plan              (many-to-one)
Plan          →  Subscription[]    (one-to-many)
Lead          →  User              (many-to-one)
ScanUsage     →  User              (many-to-one)
Waitlist      →  (standalone)      (email capture)
```

---

## Key Technical Decisions

| Decision | Rationale |
|----------|-----------|
| **Server Actions over API routes** | Type-safe, no manual fetch/endpoint management, co-located with server logic |
| **JWT strategy over database sessions** | Stateless, no session table lookups, works with SQLite |
| **Client-side image compression** | Reduces upload size before hitting the server, faster AI processing |
| **Zod v4 validation (shared)** | Same schemas validate on client and server — no duplicated logic |
| **Base UI via shadcn/ui** | Accessible, unstyled primitives — full control over design |
| **Prisma + SQLite for dev** | Zero-config local development, easy migration to PostgreSQL for production |
| **Gemini 2.0 Flash** | Fast, accurate OCR with structured JSON output, generous free tier |

---

## What's Next

- [ ] **Stripe Integration** — Checkout sessions, plan upgrades, webhook handling
- [ ] **Password Reset** — Email-based reset flow
- [ ] **Email Notifications** — Lead activity alerts
- [ ] **CRM Integrations** — Salesforce, HubSpot, Pipedrive connectors
- [ ] **Batch Scanning** — Upload multiple cards at once
- [ ] **Team Workspaces** — Multi-user organizations with roles
- [ ] **Mobile App** — React Native companion with offline scanning
- [ ] **PostgreSQL Migration** — Production-ready database for deployment

---

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
pnpm i -g vercel

# Deploy
vercel
```

### Docker

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
RUN pnpm install && pnpm build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
CMD ["node", "server.js"]
```

---

## Author

**Your Name** — [GitHub](https://github.com/amitmishra-20) • [LinkedIn](https://linkedin.com/in/im-amit-mishra) • [Email](mailto:amitmishra20900@gmail.com)

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
# card-scanner
