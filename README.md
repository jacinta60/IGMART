# IGMART VENTURES — Supermarket Management System

A full-featured, self-hosted point-of-sale and inventory management web app for
small-to-medium supermarkets, built with **Next.js 16 (App Router)**,
**Drizzle ORM**, **PostgreSQL**, and **Tailwind CSS**.

Manage products, stock, suppliers, customers, purchases, expenses, employees and
sales from one dashboard, with a fast POS checkout, printable receipts, and
business reports (revenue, profit, best-sellers, sales-by-cashier).

## Features

- **Dashboard** — live KPIs, low-stock & expiry alerts, recent sales, top products, 7-day sales chart.
- **Point of Sale (POS)** — quick product search, cart, discounts, cash/card payment, printable receipt.
- **Inventory** — products with categories, units, cost/price, barcodes, stock levels, expiry dates.
- **Purchasing** — supplier purchases that auto-increment stock.
- **Customers** — profiles with loyalty points and lifetime spend.
- **Suppliers & Expenses** — track sourcing and overhead.
- **Reports** — revenue, gross/net profit, best-sellers and per-cashier breakdowns over a date range.
- **Employees** — admin/employee accounts with role-based sidebar.
- **Auth** — username/password login with an `auth_token` cookie and middleware route protection.
- **Seed** — one-click sample data to explore the UI.

## Tech Stack

| Layer        | Choice                                  |
|--------------|-----------------------------------------|
| Framework    | Next.js 16 (App Router, React 19, TS)   |
| Database     | PostgreSQL                              |
| ORM          | Drizzle ORM + drizzle-kit               |
| Styling      | Tailwind CSS v4                         |
| Charts       | Recharts                                |
| Icons        | lucide-react                            |

## Prerequisites

- Node.js 18.18+ (Node 20+ recommended)
- A PostgreSQL database (local or hosted)

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
#    Edit .env and set DATABASE_URL to your PostgreSQL connection string.

# 3. Create the database schema (choose one)
npm run db:migrate   # apply tracked migrations (recommended)
# or
npm run db:push      # push schema directly without migration history

# 4. (Recommended) Seed demo data so you can log in:
npm run db:seed
#    Creates admin/admin and staff/staff plus sample products/categories/units.
#    (You can also re-seed later from the dashboard's "Load Sample Data" button,
#    but that requires being logged in first — so use this on a fresh database.)

# 5. Run the dev server
npm run dev
```

Open http://localhost:3000 and sign in with the seeded credentials:

| Role    | Username | Password |
|---------|----------|----------|
| Admin   | `admin`  | `admin`  |
| Staff   | `staff`  | `staff`  |

> The seed endpoint truncates and recreates users, categories, units and
> products, so only use it on a fresh/dev database.

## Scripts

| Script             | Description                              |
|--------------------|------------------------------------------|
| `npm run dev`      | Start the Next.js dev server             |
| `npm run build`    | Production build                         |
| `npm run start`    | Run the production build                 |
| `npm run lint`     | ESLint                                   |
| `npm run typecheck`| TypeScript type checking (`tsc --noEmit`)|
| `npm run db:generate` | Generate a Drizzle migration from the schema |
| `npm run db:migrate`  | Apply pending migrations                |
| `npm run db:push`    | Push schema to the DB (no history)      |
| `npm run db:studio`  | Open Drizzle Studio                      |

## Project Structure

```
src/
  app/
    api/            # Route Handlers (auth, products, sales, reports, ...)
    pos/            # Point-of-sale checkout
    products/ ...   # Feature pages
    login/          # Auth screen
  components/        # Sidebar, ConfirmDialog
  db/
    index.ts        # Lazy PostgreSQL pool + drizzle instance
    schema.ts       # Drizzle table definitions
  middleware.ts     # Server-side route protection
drizzle/            # Generated SQL migrations
```

## Notes & Roadmap

- Passwords are stored in plaintext in this MVP — hash them (e.g. bcrypt/argon2)
  and set the `auth_token` cookie `httpOnly` before any real deployment.
- Reports use a simplified profit model (sale price − product cost price).
- Potential next steps: bar/QR-code scanning, multi-store support, CSV
  import/export, password reset, and audit logging.

## License

Internal use — IGMART VENTURES.
