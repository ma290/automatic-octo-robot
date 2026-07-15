# Estate Plus CRM — Property Inventory Management 2.0

An internal property inventory management system for real estate brokers and developers. **Not** a customer-facing listing portal — this is an ops tool designed for speed of adding/searching properties with a clean, modern, mobile-friendly UI.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 |
| Database | Prisma ORM + SQLite (Postgres-compatible schema) |
| State | Zustand (persisted UI state) |
| Validation | Zod + react-hook-form |
| Icons | Lucide React |
| Charts | Recharts |

## Features

- **Dashboard** — Summary cards, status breakdown, recent properties, quick actions
- **Property Listing** — Grid/list toggle, debounced search, advanced filters, pagination
- **Property Detail** — Image gallery, price history, activity timeline, document viewer
- **Add/Edit Property** — 5-step multi-step form with validation
- **Projects** — Tower → Floor → Unit availability grid (color-coded)
- **Owners** — Directory with contact info and linked properties
- **Bulk Actions** — Multi-select → bulk status update, bulk delete
- **Dark/Light Mode** — System-aware with toggle
- **Fully Responsive** — Mobile bottom nav, tablet-friendly layouts

## Quick Start (Development)

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env

# 3. Push database schema
npm run db:push

# 4. Seed with demo data
npm run db:seed

# 5. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploying to Vercel

> ⚠️ **SQLite Caveat**: Vercel's filesystem is read-only/ephemeral at runtime. The SQLite database is seeded at **build time** and ships as read-only demo data. Write operations (adding properties, etc.) will work during the build but not at runtime on Vercel.

1. Push your code to a Git repository (GitHub, GitLab, Bitbucket)
2. Import the project in [Vercel Dashboard](https://vercel.com/new)
3. Set the environment variable:
   ```
   DATABASE_URL=file:./data/estate-plus.db
   ```
4. Deploy — the build step automatically runs Prisma generate, schema push, and seeds the database
5. The demo link will have pre-seeded data for full navigation

## Deploying via Docker

The Docker image is optimized for low-spec VPS (target: <150MB image, <512MB RAM at idle).

### Build and Run

```bash
# Build the image
docker build -t estate-plus-crm .

# Run with persistent data volume
docker run -p 3000:3000 -v ./data:/app/data estate-plus-crm
```

### Using Docker Compose

```bash
docker compose up -d
```

The `docker-compose.yml` mounts `./data` as a volume for SQLite persistence across container restarts.

### Koyeb / Render / Railway

1. Push to Git and connect the repo
2. Set the Dockerfile as the build method
3. Set the environment variable: `DATABASE_URL=file:./data/estate-plus.db`
4. Set port to `3000` (or use the `PORT` env var — the container respects it)
5. For persistent data on Koyeb/Render, enable persistent disk and mount to `/app/data`

### Health Check

The container includes a health check endpoint at `GET /api/health` that verifies database connectivity.

## Database

The schema uses SQLite for the prototype but is designed for easy migration to PostgreSQL:

1. Change `provider` in `prisma/schema.prisma` from `"sqlite"` to `"postgresql"`
2. Update `DATABASE_URL` in `.env` to your PostgreSQL connection string
3. Run `npx prisma db push` (or `npx prisma migrate dev` for migration history)

### Models

- **Property** — Core listing with type, status, price, location, owner info
- **PropertyImage** — Ordered images per property
- **PropertyDocument** — Documents (title deeds, floor plans, etc.)
- **PriceHistory** — Price change tracking
- **TimelineEvent** — Activity log (status changes, visits, etc.)
- **Project** — Builder/developer projects with towers and units
- **Tower** — Building towers within a project
- **Unit** — Individual units (apartments) within towers
- **Owner** — Property owner/builder directory

## Project Structure

```
estate-plus-crm/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed data (30 properties, 3 projects, 10 owners)
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout with theme provider
│   │   ├── globals.css        # Design system (dark/light themes)
│   │   ├── (dashboard)/       # All authenticated pages
│   │   │   ├── page.tsx       # Dashboard
│   │   │   ├── properties/    # Property CRUD
│   │   │   ├── projects/      # Project management
│   │   │   ├── owners/        # Owner directory
│   │   │   └── reports/       # Reports (coming soon)
│   │   └── api/               # REST API routes
│   ├── components/layout/     # Sidebar, header, mobile nav
│   ├── store/ui-store.ts      # Zustand state
│   ├── hooks/                 # Custom hooks
│   └── lib/                   # Prisma client, utils, validations
├── Dockerfile                 # Multi-stage production build
├── docker-compose.yml         # Local Docker development
├── entrypoint.sh              # Container startup script
└── .dockerignore
```

## License

Private — Internal tool prototype.
