# College Portal

A complete college website and academic portal: a public site (home, about, courses, faculty, notices, contact) plus role-based dashboards for **students**, **faculty** and the **office/admin**, backed by **MongoDB**.

Built with **Next.js 14 (App Router, TypeScript)**, **MongoDB + Mongoose**, **Tailwind CSS** and JWT cookie sessions.

---

## What's inside

| Area | What a user can do |
| --- | --- |
| Public site | Browse courses and subjects, faculty directory, notice board, contact details |
| Student | See subject-wise attendance %, published marks with grades, fee ledger with dues, notices, profile |
| Faculty | Mark attendance for a class (one screen, all students), publish marks, post notices, see assigned subjects |
| Admin | College-wide counts, create student accounts, fee ledger with payment recording, publish/pin/delete notices, view catalogue |

Access control: every dashboard route is protected by middleware, and each role can only open its own section (`/dashboard/student`, `/dashboard/staff`, `/dashboard/admin`). API routes re-check the role on the server, so the UI is never the only guard.

---

## Tech stack

- **Next.js 14** — server components, route handlers as the REST API
- **MongoDB Atlas** + **Mongoose 8** — 10 collections (see below)
- **Tailwind CSS** — no component library, so the design is fully yours to edit
- **jose** — HS256 JWT stored in an httpOnly cookie (7-day session)
- **bcryptjs** — password hashing (cost 10)

### Data model

```
Department ──< Course ──< Subject >── Staff
                    │
                 Student ──< Attendance (register per subject per day)
                    ├────< Result (per subject, per exam type)
                    └────< Fee

User (role: admin | staff | student) ──1:1── Student / Staff
Notice (public)
```

---

## Getting started

### 1. Install

```bash
npm install
```

### 2. Create the MongoDB Atlas cluster (free tier)

1. Sign in at <https://cloud.mongodb.com> and create a **free M0** cluster.
2. **Database Access** → add a database user (username + password).
3. **Network Access** → add IP `0.0.0.0/0` (fine for a college demo; narrow it for production).
4. **Connect → Drivers** → copy the connection string. It looks like:

```
mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### 3. Configure environment

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
MONGODB_URI="mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/college_portal?retryWrites=true&w=majority"
MONGODB_DB="college_portal"
JWT_SECRET="<long random string>"
SEED_TOKEN="<another random string, optional>"
```

Generate secrets with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 4. Run

```bash
npm run dev
```

Open <http://localhost:3000>.

### 5. Load demo data

With the app running, in a second terminal:

```bash
npm run seed
```

This fills the database with 3 departments, 3 programmes, 7 subjects, 1 admin, 3 faculty, 6 students, four weeks of attendance, results, fee records and 5 notices.

**Demo logins — password for all: `Password@123`**

| Role | Email |
| --- | --- |
| Admin | `admin@mdc.edu.in` |
| Faculty | `staff@mdc.edu.in` |
| Student | `student@mdc.edu.in` |

Change these before anyone else uses the site.

---

## REST API

All endpoints return JSON. Authentication is the `cp_session` cookie set by `/api/auth/login`.

| Method | Endpoint | Who | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/login` | public | Sign in, sets the session cookie |
| POST | `/api/auth/logout` | any | Clear the session |
| GET | `/api/auth/me` | any | Current user |
| GET | `/api/notices` | public | Notice board |
| POST | `/api/notices` | admin, staff | Publish a notice |
| PATCH | `/api/notices/:id` | admin, staff | Pin / unpin |
| DELETE | `/api/notices/:id` | admin, staff | Delete |
| GET | `/api/departments` | public | Departments |
| POST | `/api/departments` | admin | Add department |
| GET | `/api/courses` | public | Programmes |
| POST | `/api/courses` | admin | Add programme |
| GET | `/api/subjects?course=&semester=` | public | Subjects |
| POST | `/api/subjects` | admin | Add subject |
| GET | `/api/students?course=&semester=` | admin, staff | Class list |
| POST | `/api/students` | admin | Create student (user + profile) |
| GET | `/api/staff` | public | Faculty directory |
| POST | `/api/staff` | admin | Create faculty account |
| GET | `/api/attendance?subject=&date=` | admin, staff | One day's register |
| POST | `/api/attendance` | admin, staff | Save / overwrite a register |
| PATCH | `/api/attendance` | admin, staff | Correct one student's entry |
| GET | `/api/results?student=` | signed in | Marks |
| POST | `/api/results` | admin, staff | Publish marks (bulk upsert) |
| GET | `/api/fees?student=` | signed in | Fee ledger |
| POST | `/api/fees` | admin | Raise a bill |
| PATCH | `/api/fees/:id` | admin | Record a payment |
| DELETE | `/api/fees/:id` | admin | Remove a bill |
| GET | `/api/users` | admin | All accounts |
| PATCH | `/api/users/:id` | admin | Rename, reset password, activate/deactivate |
| DELETE | `/api/users/:id` | admin | Remove account |
| GET | `/api/stats` | admin | Dashboard counts |
| POST | `/api/seed` | empty DB or `x-seed-token` | Load demo data |

---

## Project structure

```
src/
├── app/
│   ├── (site)/            public pages: home, about, courses, faculty, notices, contact
│   ├── login/             sign-in screen
│   ├── dashboard/         role dashboards (student, staff, admin)
│   └── api/               REST route handlers
├── components/            UI kit and client forms
├── config/site.ts         college name, address, nav, grading scale
├── lib/                   db connection, auth, queries, seed
├── models/                Mongoose schemas
└── middleware.ts          route protection by role
```

### Making it your college's

- Edit `src/config/site.ts` — name, address, phone, email, navigation, grading scale.
- Swap the colour palette in `tailwind.config.ts` (`brand` scale).
- Replace the demo data: sign in as admin and add your departments, programmes and students.

---

## Deploying

**Vercel** (recommended, free tier):

1. Push this repo to GitHub (already done).
2. Import it at <https://vercel.com/new>.
3. Add the environment variables `MONGODB_URI`, `MONGODB_DB`, `JWT_SECRET`.
4. Deploy. Then call `/api/seed` once with the `x-seed-token` header, or seed locally against the same Atlas cluster.

**Any Node host** (Render, Railway, a college VM):

```bash
npm run build
npm start
```

Set the same environment variables. `secure` cookies switch on automatically when `NODE_ENV=production`, so serve the site over HTTPS.

---

## Security notes

- Passwords are hashed with bcrypt; the hash is `select: false` in the schema.
- Sessions are httpOnly, sameSite=lax, secure in production.
- Every mutating API route checks the caller's role server-side.
- Rotate `JWT_SECRET` to invalidate all existing sessions.
- Before going live: change the demo passwords, restrict Atlas network access, and take Atlas backups.

---

## Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Development server on :3000 |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run seed` | Load demo data via `/api/seed` (app must be running) |
