# CLAUDE.md

We're building the app described in @SPEC.md. Read that file for general architectural tasks or to double-check the exact database structure, tech stack or application architecture.

Keep your replies extremely concise and focus on conveying the key information. No unnecessary fluff, no long code snippets.

Whenever working with any third-party library or something similar, you MUST look up the official documentation to ensure that you're working with up-to-date information.
Use the DocsExplorer subagent for efficient documentation lookup.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Natours is a full-stack adventure tour booking platform — Express REST API + server-side Pug views, MongoDB/Mongoose, JWT auth, Stripe payments, Multer+Sharp image uploads, and Nodemailer emails. Currently JavaScript (CommonJS); **a TypeScript migration is planned** — see `SPEC.md` for full details.

## Commands

```bash
# Development (with hot reload)
npm run start:dev

# Production
npm run start:prod

# Bundle frontend JS (public/js/index.js → public/js/bundle.js)
npm run watch:js
npm run build:js

# Seed / wipe the database
node dev-data/data/import-dev-data.js --import
node dev-data/data/import-dev-data.js --delete
```

There is no test suite in this project.

## Architecture

### Entry points

- `server.js` — process-level setup (dotenv, mongoose connect, uncaughtException/unhandledRejection handlers), then starts `app.js`
- `app.js` — Express app: middleware stack (helmet, morgan, rate-limit, body-parser, cookie-parser, mongoSanitize, xss-clean, hpp), then mounts all routers

### Routing layers

```
GET /                 → viewRouter   → viewsController   (Pug renders)
/api/v1/tours         → tourRouter   → tourController
/api/v1/users         → userRouter   → userController + authController
/api/v1/reviews       → reviewRouter → reviewController
/api/v1/bookings      → bookingRouter→ bookingController
```

Reviews are also nested under tours: `GET /api/v1/tours/:tourId/reviews`.

### Key patterns

**`handlerFactory.js`** — generic CRUD factory that returns Express handlers for any Mongoose model: `getAll`, `getOne`, `createOne`, `updateOne`, `deleteOne`. Most controllers are thin wrappers around these, with model-specific logic (image upload, geospatial) added before/after.

**`catchAsync.js`** — wraps async route handlers so thrown errors propagate to Express's error handler via `next(err)`.

**`APIFeatures` (`utils/apiFeatures.js`)** — chainable query builder (`.filter()`, `.sort()`, `.limitFields()`, `.paginate()`) used in all `getAll` handlers. Query params like `?duration[gte]=5&sort=price` are mapped to Mongoose operators.

**`AppError` (`utils/appError.js`)** — custom error class with `statusCode`, `status`, and `isOperational`. All operational errors flow through `controllers/errorController.js`, which splits handling into dev (full stack) vs prod (safe message).

**Auth middleware (`authController.js`)** — `protect` (JWT verify → attach `req.user`), `restrictTo(...roles)` (role-based gate), `isLoggedIn` (cookie-based for Pug views, non-throwing).

**`Email` class (`utils/email.js`)** — wraps Nodemailer with Pug template rendering. Uses Mailtrap in dev, SendGrid in prod (based on `NODE_ENV`).

### Models

| Model | Key behaviors |
|---|---|
| `Tour` | `pre('save')` slugify; virtual `durationWeeks`; virtual populate for reviews; geospatial index on `startLocation` |
| `User` | `pre('save')` bcrypt hash; `pre(/^find/)` filters `active: false`; instance methods: `correctPassword`, `changedPasswordAfter`, `createPasswordResetToken` |
| `Review` | Compound index `{tour, user}` (one review per user per tour); `statics.calcAverageRatings` aggregation pipeline triggered on `post('save')` and `post(/^findOneAnd/)` |
| `Booking` | Simple join of Tour + User + price; `paid` flag |

### Known bugs (fix during TS migration, per SPEC.md)

1. `handlerFactory.js:53` — `query.populate(populate)` should be `query.populate(popOptions)`
2. `apiFeatures.js:19` — `JSON.parse(queryObj)` should be `JSON.parse(queryStr)`
3. `reviewModel.js:97-100` — second `pre(/^findOneAnd/)` hook should be `post(/^findOneAnd/)` with no `next` parameter

## Environment

Config is loaded from `config.env` (not `.env`). Required variables:

```
NODE_ENV, PORT, DATABASE, DATABASE_PASSWORD,
JWT_SECRET, JWT_EXPIRES_IN, JWT_COOKIE_EXPIRES_IN,
EMAIL_USERNAME, EMAIL_PASSWORD, EMAIL_HOST, EMAIL_PORT,
STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
```

## Linting / Formatting

```bash
# ESLint (airbnb + prettier + node)
npx eslint .

# Prettier
npx prettier --write .
```

Config: `.eslintrc.json` (airbnb base), `.prettierrc`.

## Planned Migration (SPEC.md)

The `feature/upgrade` branch is the target for a JS → TypeScript migration. Key decisions from the spec:

- Source moves to `src/`, compiled to `dist/`, `tsconfig.json` targets `CommonJS` + `ES2022`
- `tsx watch src/server.ts` replaces `nodemon server.js` for dev
- Express 5, Mongoose 8, Stripe v17, html-to-text v9 — all with breaking changes detailed in `SPEC.md`
- `xss-clean` removed; replaced with inline `sanitize-html` middleware
- ESLint migrates to v9 flat config (`eslint.config.mjs`)
- Express Request augmented via `src/types/express.d.ts` to add `req.user` and `req.requestTime`
