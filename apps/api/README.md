# ZIRIOS — Backend (`apps/api`)

Express + Prisma storefront API powering the ZIRIOS web app. Talks to the
Next.js frontend at [`apps/web`](../web) over `http://localhost:4000/api/v1`.

## Stack

- **Express** — HTTP server
- **Prisma** + **SQLite** — ORM + database (zero-config; swap to Postgres in
  `prisma/schema.prisma` when ready)
- **JWT** — access token in the response body + refresh token in an httpOnly cookie
- **bcryptjs** — password hashing
- **zod** — request validation

## Quick start

```bash
cd apps/api
cp .env.example .env          # then edit secrets for production
npm install
npm run db:push               # create SQLite schema
npm run seed                  # seed admin user + starter products
npm run dev                   # http://localhost:4000/api/v1
```

Seeded admin login (change the password immediately in production):

```
email: admin@zirios.eg
password: admin123
```

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the API with live reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled server |
| `npm run db:push` | Apply schema to the database |
| `npm run seed` | Seed starter data |
| `npm run db:studio` | Open Prisma Studio GUI |
| `npm run typecheck` | Type-check without emitting |

## API surface

All routes are prefixed with `/api/v1`.

| Area | Method & path |
| --- | --- |
| Auth | `POST /auth/register` · `POST /auth/login` · `POST /auth/refresh` · `POST /auth/logout` |
| Catalog | `GET /products/:slug` · `GET /categories/:slug` · `GET /collections/:slug` |
| Reviews | `POST /products/:slug/reviews` |
| User | `GET /users/me` · `GET /users/me/addresses` · `POST /users/me/addresses` · `DELETE /users/me/addresses/:id` |
| Wishlist | `GET /wishlist` · `POST /wishlist` · `DELETE /wishlist/:id` |
| Orders | `GET /orders` · `POST /orders` |
| Coupons | `GET /coupons/:code/validate` |
| Payments | `POST /payments/create-payment-intent` |
| Admin | `GET /admin/analytics` · `GET /admin/inventory` · `PATCH /admin/inventory/:id/stock` |

> Payments are mocked — `create-payment-intent` returns a fake `clientSecret`
> and marks the order `AWAITING_PAYMENT`. Swap in real Stripe later by editing
> `src/routes/payment.routes.ts`.

## Project layout

```
apps/api/
├─ prisma/
│  ├─ schema.prisma   # data models
│  └─ seed.ts         # starter data
└─ src/
   ├─ server.ts       # express app + route mounting
   ├─ lib/
   │  ├─ prisma.ts    # PrismaClient singleton
   │  └─ auth.ts      # JWT helpers, requireAuth / requireAdmin, AppError
   ├─ middleware/
   │  └─ error.ts     # centralized error handler → { error }
   └─ routes/         # one file per resource area
```

## Notes

- All prices are stored and returned in **cents**; the frontend divides by 100.
- Errors always return `{ "error": "<message>" }` so the web app's existing
  error handling works unchanged.
- `.env` is gitignored — never commit secrets.
