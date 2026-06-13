# MessBoard — Mass Management System

Full-stack web application for managing a shared dining/mess facility. Tracks daily meals, grocery costs, finances, cleaning duties, and generates monthly reports.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 |
| ORM | Prisma 7 |
| Database | PostgreSQL (Neon) |
| Auth | NextAuth.js v5 (Email/Password + Google OAuth) |
| File Storage | ImageKit |
| Data Fetching | TanStack Query v5 + Axios |
| Package Manager | pnpm |

## Prerequisites

- **Node.js** ≥ 18
- **pnpm** (install: `npm install -g pnpm`)
- **PostgreSQL** database (local or cloud, e.g. [Neon](https://neon.tech))

## Quick Start

```bash
# 1. Clone and enter the project
cd MessBoard

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
#    Fill in .env with your credentials (see below)

# 4. Push database schema
npx prisma migrate dev --name init

# 5. Generate Prisma client
npx prisma generate

# 6. Start dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables (`.env`)

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@host/db?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate_with: openssl rand -base64 32"

# Google OAuth (https://console.cloud.google.com)
GOOGLE_CLIENT_ID="your_client_id"
GOOGLE_CLIENT_SECRET="your_client_secret"

# ImageKit (https://imagekit.io)
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/your_id"
IMAGEKIT_PUBLIC_KEY="your_public_key"
IMAGEKIT_PRIVATE_KEY="your_private_key"
IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/your_id"
```

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
2. Create an **OAuth 2.0 Client ID** (Web application)
3. Add to **Authorized JavaScript origins**: `http://localhost:3000`
4. Add to **Authorized redirect URIs**: `http://localhost:3000/api/auth/callback/google`
5. Copy the Client ID and Client Secret to `.env`

### ImageKit Setup

1. Sign up at [ImageKit.io](https://imagekit.io)
2. Go to Developer Options → copy **Public Key**, **Private Key**, and **URL Endpoint**
3. Paste into `.env`

## Database Setup

```bash
# Create and apply migrations
npx prisma migrate dev --name init

# Regenerate client after schema changes
npx prisma generate

# Open Prisma Studio (GUI)
npx prisma studio
```

## Features

| Feature | Description |
|---|---|
| **Dashboard** | Monthly overview — meals, meal rate, bazar cost, member balances |
| **Meals** | Calendar table with per-member/per-day meal count (B/L/D) |
| **Bazar** | Grocery expense tracking with per-member breakdown |
| **Finance** | GIVE/TAKE transactions, fund summary, member net balance |
| **Notes** | Pinned/unpinned shared notes board |
| **Cleaning** | Duty log with ImageKit multi-image upload & gallery |
| **Members** | Admin role management, activate/deactivate members |
| **Audit Logs** | Track all CRUD actions (admin only) |
| **Reports** | Monthly text report download |
| **Settings** | Toggle page visibility in sidebar |
| **Dark Mode** | Persisted in localStorage |

## Role-Based Access

| Role | Permissions |
|---|---|
| **USER** | View all, edit own meals/notes, add bazar/cleaning entries |
| **ADMIN** | Edit any entry, manage members, toggle pages, view audit logs |
| **SUPERADMIN** | Full access including role assignment |

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |

## Project Structure

```
src/
├── app/
│   ├── (auth)/login,register/    # Auth pages
│   ├── (dashboard)/               # All feature pages
│   └── api/                       # 18+ API routes
├── components/                    # React components
│   ├── layout/                    # Sidebar, Header
│   ├── meals/ bazar/ finance/ cleaning/ notes/
│   ├── members/ audit/ reports/
│   └── shared/                    # PageGuard, ConfirmDialog, etc.
├── hooks/                         # TanStack Query hooks
├── services/                      # API service layer
├── lib/                           # Prisma, Auth, Axios, ImageKit
├── types/                         # TypeScript types
├── constants/                     # Roles, pages, query keys
├── validations/                   # Zod schemas
└── proxy.ts                       # Auth middleware
```
