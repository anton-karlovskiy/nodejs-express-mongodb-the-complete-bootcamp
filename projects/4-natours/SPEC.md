# Natours Upgrade Spec: JavaScript → TypeScript + Modern Packages

## Project Summary

Natours is a full-stack tour booking application built as a course project by Jonas Schmedtmann. It demonstrates core Node.js/Express patterns that are valuable and worth preserving through the upgrade.

**Stack:** Express REST API + server-side Pug views, MongoDB/Mongoose, JWT auth, Stripe payments, Multer + Sharp image uploads, Nodemailer emails.

---

## Goals

1. Migrate all server-side source files from JavaScript (CommonJS) to TypeScript (ESM-compatible).
2. Upgrade every dependency to its current major version.
3. Fix known bugs found in the original code.
4. Preserve all architectural patterns and business logic exactly — no feature creep.
5. Update tooling: ESLint v9 (flat config), Prettier v3, ts-node + tsx for dev.

Out of scope: redesigning the Pug templates, adding tests, migrating the frontend bundler (public/js) beyond what is required to keep it working.

---

## File Map

```
server.js               → src/server.ts
app.js                  → src/app.ts
controllers/
  authController.js     → src/controllers/authController.ts
  bookingController.js  → src/controllers/bookingController.ts
  errorController.js    → src/controllers/errorController.ts
  handlerFactory.js     → src/controllers/handlerFactory.ts
  reviewController.js   → src/controllers/reviewController.ts
  tourController.js     → src/controllers/tourController.ts
  userController.js     → src/controllers/userController.ts
  viewsController.js    → src/controllers/viewsController.ts
models/
  bookingModel.js       → src/models/bookingModel.ts
  reviewModel.js        → src/models/reviewModel.ts
  tourModel.js          → src/models/tourModel.ts
  userModel.js          → src/models/userModel.ts
routes/
  bookingRoutes.js      → src/routes/bookingRoutes.ts
  reviewRoutes.js       → src/routes/reviewRoutes.ts
  tourRoutes.js         → src/routes/tourRoutes.ts
  userRoutes.js         → src/routes/userRoutes.ts
  viewRoutes.js         → src/routes/viewRoutes.ts
utils/
  apiFeatures.js        → src/utils/apiFeatures.ts
  appError.js           → src/utils/appError.ts
  catchAsync.js         → src/utils/catchAsync.ts
  email.js              → src/utils/email.ts
dev-data/data/
  import-dev-data.js    → src/dev-data/import-dev-data.ts
```

---

## TypeScript Configuration

`tsconfig.json` at project root:

- `target`: `ES2022`
- `module`: `CommonJS` (keep require-style interop; avoid ESM complexity with Mongoose/Express)
- `moduleResolution`: `node`
- `strict`: `true`
- `outDir`: `dist`
- `rootDir`: `src`
- `esModuleInterop`: `true`
- `resolveJsonModule`: `true`
- `skipLibCheck`: `true`

---

## Express Type Augmentation

Create `src/types/express.d.ts` to extend Express Request:

```ts
import { IUser } from '../models/userModel';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      requestTime?: string;
    }
  }
}
```

---

## Dependency Upgrades

### Runtime dependencies

| Package | Old | New | Notes |
|---|---|---|---|
| `express` | `^4.16` | `^5.0` | Express 5 is stable; async errors propagate automatically |
| `mongoose` | `^5.5` | `^8.x` | Remove deprecated connect options (`useNewUrlParser` etc.) |
| `jsonwebtoken` | `^8.5` | `^9.0` | Minor API tweaks; `promisify(jwt.verify)` still works |
| `bcryptjs` | `^2.4` | `^3.0` | Drop-in compatible |
| `dotenv` | `^7.0` | `^16.x` | Add `dotenv/config` import style |
| `helmet` | `^3.16` | `^8.x` | Call `helmet()` with no args still works; CSP defaults changed |
| `express-rate-limit` | `^3.5` | `^7.x` | Constructor option `max` renamed to `limit` |
| `express-mongo-sanitize` | `^1.3` | `^2.x` | Drop-in |
| `hpp` | `^0.2` | `^0.2` | No change needed |
| `cookie-parser` | `^1.4` | `^1.4` | No change needed |
| `morgan` | `^1.9` | `^1.10` | Drop-in |
| `multer` | `^1.4` | `^1.4.5-lts.1` | Stay on 1.x LTS; v2 is RC |
| `sharp` | `^0.22` | `^0.33` | API is compatible |
| `slugify` | `^1.3` | `^1.6` | Drop-in |
| `validator` | `^10.11` | `^13.x` | Drop-in |
| `nodemailer` | `^6.1` | `^6.9` | Drop-in; use `@types/nodemailer` |
| `pug` | `^2.0` | `^3.0` | Drop-in |
| `stripe` | `^7.0` | `^17.x` | **Breaking** — see Stripe section below |
| `html-to-text` | `^5.1` | `^9.x` | **Breaking** — `fromString()` → `convert()` |
| `xss-clean` | `^0.1` | **removed** | Deprecated/unmaintained; replace with `sanitize-html` |
| `axios` | `^0.18` | `^1.x` | Used in public/js only; update import |
| `@babel/polyfill` | `^7.4` | **removed** | Deprecated; replace with `core-js` if still needed in frontend |

### Dev dependencies (new)

| Package | Purpose |
|---|---|
| `typescript` | Compiler |
| `tsx` | Fast TS execution for dev (replaces `nodemon server.js`) |
| `@types/express` | Express types |
| `@types/node` | Node types |
| `@types/morgan` | Morgan types |
| `@types/bcryptjs` | bcryptjs types |
| `@types/jsonwebtoken` | JWT types |
| `@types/multer` | Multer types |
| `@types/nodemailer` | Nodemailer types |
| `@types/pug` | Pug types |
| `@types/cookie-parser` | Cookie-parser types |
| `@types/hpp` | hpp types |
| `@types/validator` | Validator types |
| `@types/html-to-text` | html-to-text types |
| `@types/sanitize-html` | sanitize-html types |
| `eslint` | `^9.x` (flat config) |
| `@typescript-eslint/eslint-plugin` | TS lint rules |
| `@typescript-eslint/parser` | TS parser for ESLint |
| `eslint-config-prettier` | Prettier compat |
| `prettier` | `^3.x` |

### Dev dependencies (removed)

- `parcel-bundler` v1 → upgrade to `parcel` v2 (or defer frontend bundling)
- `ndb` (deprecated debugger; use `--inspect` flag)
- All `eslint-plugin-react`, `eslint-plugin-jsx-a11y` (React not used server-side)
- `eslint-config-airbnb` → replaced by `@typescript-eslint` rules

---

## Breaking Change Details

### Stripe v7 → v17

`bookingController.ts` needs the line_items format updated:

```ts
// Old (v7)
line_items: [{
  name: `${tour.name} Tour`,
  description: tour.summary,
  images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
  amount: tour.price * 100,
  currency: 'usd',
  quantity: 1
}]

// New (v17)
line_items: [{
  price_data: {
    currency: 'usd',
    unit_amount: tour.price * 100,
    product_data: {
      name: `${tour.name} Tour`,
      description: tour.summary,
      images: [`https://www.natours.dev/img/tours/${tour.imageCover}`]
    }
  },
  quantity: 1
}]
```

Also add `mode: 'payment'` to `stripe.checkout.sessions.create()`.

### html-to-text v5 → v9

`email.ts`:

```ts
// Old
import { fromString } from 'html-to-text';
text: fromString(html)

// New
import { convert } from 'html-to-text';
text: convert(html)
```

### xss-clean → sanitize-html

`app.ts`:

```ts
// Old
import xss from 'xss-clean';
app.use(xss());

// New
import sanitizeHtml from 'sanitize-html';
app.use((req, _res, next) => {
  if (req.body) req.body = JSON.parse(sanitizeHtml(JSON.stringify(req.body)));
  next();
});
```

### Mongoose v5 → v8 connect options

`server.ts`:

```ts
// Old
mongoose.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
})

// New
mongoose.connect(DB)
```

### Express 5 async error propagation

In Express 5, async route handlers automatically forward thrown errors to the error middleware — `catchAsync` is no longer strictly necessary but can stay as a no-op wrapper for compatibility during migration.

### express-rate-limit v3 → v7

```ts
// Old
rateLimit({ max: 100, windowMs: 60 * 60 * 1000, message: '...' })

// New
rateLimit({ limit: 100, windowMs: 60 * 60 * 1000, message: '...' })
```

---

## Bugs to Fix During Migration

These bugs exist in the original code and must be corrected:

1. **`handlerFactory.ts` `getOne`** — `populate` used instead of `popOptions`:
   ```ts
   // Bug
   if (popOptions) query = query.populate(populate);
   // Fix
   if (popOptions) query = query.populate(popOptions);
   ```

2. **`apiFeatures.ts` `filter()`** — `queryObj` used after `queryStr` transformation:
   ```ts
   // Bug
   this.query = this.query.find(JSON.parse(queryObj));
   // Fix
   this.query = this.query.find(JSON.parse(queryStr));
   ```

3. **`reviewModel.ts` second `pre(/^findOneAnd/)` hook** — missing `next` parameter and call:
   ```ts
   // Bug
   reviewSchema.pre(/^findOneAnd/, async function(next) {
     await this.r.constructor.calcAverageRatings(this.r.tour);
   });
   // Fix — also note: `this.r` is set in the first hook so both hooks must stay
   reviewSchema.post(/^findOneAnd/, async function() {
     await this.r.constructor.calcAverageRatings(this.r.tour);
   });
   ```

---

## npm Scripts

```json
{
  "build": "tsc",
  "start:dev": "tsx watch src/server.ts",
  "start:prod": "NODE_ENV=production node dist/server.js",
  "typecheck": "tsc --noEmit",
  "lint": "eslint src"
}
```

---

## ESLint Config

Switch to flat config (`eslint.config.mjs`):

```js
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  ...tseslint.configs.recommended,
  prettierConfig,
  {
    rules: {
      'no-console': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: 'req|res|next' }]
    }
  }
);
```

---

## What to Preserve Unchanged

- All Mongoose schemas (field definitions, indexes, virtuals)
- All Mongoose middleware hooks (pre/post save, find, etc.)
- All route definitions and middleware chains
- `AppError` class pattern
- `catchAsync` wrapper
- `APIFeatures` class (filter, sort, limitFields, paginate)
- `handlerFactory` CRUD pattern
- `Email` class with `newTransport`/`send` methods
- Global error handler with dev/prod split
- `protect`/`restrictTo`/`isLoggedIn` auth middleware pattern
- `uncaughtException` and `unhandledRejection` process handlers
- All Pug views (unchanged)
- All public assets

---

## Sequence

1. Install TypeScript and type packages; create `tsconfig.json` and `src/types/express.d.ts`
2. Update all runtime dependencies; remove deprecated ones
3. Move and convert files one layer at a time: `utils/` → `models/` → `controllers/` → `routes/` → `app.ts` → `server.ts`
4. Apply bug fixes listed above
5. Apply breaking change adaptations (Stripe, html-to-text, xss-clean, Mongoose connect, rate-limit)
6. Update `package.json` scripts and ESLint/Prettier config
7. `pnpm typecheck` — resolve all type errors
8. Manual smoke test with a running MongoDB instance
