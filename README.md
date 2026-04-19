# Studio Beauty — Appointments

Web app for booking appointments at a beauty studio: a public page with calendar and availability, plus an admin area for services, business hours, scheduling rules, and team accounts.

## Features

- **Public booking** — pick a service, date, and time within a configurable window (e.g. 30 days ahead), respecting working hours, service duration, and blocks.
- **`/admin` panel** — session-based auth; manage appointments (confirm/reject), weekly schedule, services and durations, closed days and blocked hours, and administrators (**owner** vs **admin** roles).

## Stack

| Layer      | Technology                                                                                |
| ---------- | ----------------------------------------------------------------------------------------- |
| Framework  | [Next.js](https://nextjs.org/) 16 (App Router)                                            |
| UI         | React 19, [Tailwind CSS](https://tailwindcss.com/) 4                                      |
| Database   | [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/)               |
| Admin auth | JWT in an httpOnly cookie ([jose](https://github.com/panva/jose)), bcrypt password hashes |
| Dates      | [date-fns](https://date-fns.org/)                                                         |
| Tests      | [Vitest](https://vitest.dev/)                                                             |

## Requirements

- **Node.js** 20 or newer
- A reachable **MongoDB** instance (local, Docker, or [Atlas](https://www.mongodb.com/cloud/atlas))

## Quick start

1. **Clone and install**

   ```bash
   git clone <repository-url>
   cd appointment-app
   npm install
   ```

2. **Environment variables** — create `.env.local` at the project root:

   | Variable               | Required                 | Description                                                                                                                                                                             |
   | ---------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
   | `MONGODB_URI`          | Yes                      | MongoDB connection URI.                                                                                                                                                                 |
   | `ADMIN_SESSION_SECRET` | In production            | At least **32 random characters**. Signs the session JWT (HS256). Changing it invalidates existing sessions.                                                                            |
   | `ADMIN_PASSWORD`       | No                       | **Development only:** if `ADMIN_SESSION_SECRET` is shorter than 32 characters, this can be used as a fallback **only to derive the JWT key** — it is **not** any user’s login password. |
   | `ADMIN_SETUP_TOKEN`    | Production (first admin) | When the database is empty, the first admin signup must send this token (matching the env value). In development it can be omitted if the variable is empty.                            |

3. **Local MongoDB with Docker (optional)**

   ```bash
   docker compose up -d
   ```

   `docker-compose.yml` exposes MongoDB on `127.0.0.1:27018` with user `admin` and password `password123` (change if you change the compose file). Example URI:

   ```text
   MONGODB_URI=mongodb://admin:password123@127.0.0.1:27018/?authSource=admin
   ```

4. **Run the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). Admin login: [http://localhost:3000/admin/login](http://localhost:3000/admin/login).

### Administrators and roles

Admin users live in the `AdminUser` collection (email + **bcrypt** hash). The **first** user created (bootstrap) is the **owner**. On older databases, if no `owner` exists, the oldest user may be promoted automatically.

- The **owner** can create accounts and activate/deactivate other admins in the **Team** tab.
- **No one** can deactivate their own account.
- Other users are `admin`: they can manage the schedule and settings and change their own password (`POST /api/admin/auth/change-password`).

## Scripts

| Command              | Description                 |
| -------------------- | --------------------------- |
| `npm run dev`        | Next.js development server  |
| `npm run build`      | Production build            |
| `npm start`          | Serve after `npm run build` |
| `npm run lint`       | ESLint                      |
| `npm run test`       | Vitest (single run)         |
| `npm run test:watch` | Vitest in watch mode        |

## CI and deployment

GitHub Actions (`.github/workflows/ci.yml`):

- On **push** and **pull request** to `main` or `master`: install dependencies, run **lint**, **tests**, and **build** (MongoDB service for CI).
- Optional **Vercel production deploy** job: runs only if `vars.ENABLE_VERCEL_ACTIONS_DEPLOY == 'true'` and secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` are set. You can use the `production` environment with required reviewers.

On Vercel (or any host), set the same production environment variables, especially `MONGODB_URI` and `ADMIN_SESSION_SECRET`.

## Security and operations

- Admin session: **httpOnly** cookie with JWT (`sub` = user id, `sv` = session version). On password change, the version increments and **other sessions** for that user become invalid; the response refreshes the cookie. HS256 key derived from `ADMIN_SESSION_SECRET` (via SHA-256).
- Security-related HTTP headers are set in `next.config.ts` (frame, content-type, referrer, permissions-policy).

## Repository layout (overview)

- `src/app/` — App Router routes, public pages and `/admin`, API routes under `src/app/api/`.
- `src/components/` — shared UI (e.g. booking calendar).
- `src/models/` — Mongoose schemas.
- `src/lib/` — utilities (business logic, Brazil phone helpers, etc.).

---

License and credits as defined in the repository. For production, always verify environment variables and MongoDB backups.
