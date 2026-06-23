# NevInfotech Portal

A corporate document workspace built with **Next.js 15** (App Router), **Supabase**
(auth + database) and **Cloudflare R2** (file storage), deployable to **Cloudflare Pages**.

Each authenticated user creates one or more **companies**; each company gets a private
R2 storage path (`companies/{company-id}/`) and a ledger of uploaded files (PDF, DOCX,
XLSX, PNG, JPG) with metadata tracked in Supabase.

---

## 1. Tech stack

| Layer            | Choice                                                            |
|------------------|--------------------------------------------------------------------|
| Framework        | Next.js 15 (App Router, Server Components, Route Handlers)        |
| Auth & DB        | Supabase Auth (Google OAuth, Microsoft/Azure OAuth, email+password with email confirmation) + Supabase Postgres |
| File storage     | Cloudflare R2 (S3-compatible), accessed via presigned URLs         |
| Styling          | Tailwind CSS, `next-themes` for dark/light mode                    |
| Deployment       | Cloudflare Pages via `@opennextjs/cloudflare`                      |

**Why Supabase Auth instead of a separate auth library?** Supabase Auth natively
supports Google and Microsoft (Azure) OAuth as well as email/password sign-up with
built-in email verification — so one system covers every login method in the brief
without bolting on NextAuth as well.

**Why presigned URLs for uploads?** The browser uploads straight to R2 using a
short-lived signed URL that the server issues; file bytes never pass through a Next.js
function. This keeps uploads fast and avoids serverless body-size limits.

---

## 2. Project structure

```
nevinfotech-portal/
├─ src/
│  ├─ app/
│  │  ├─ login/page.tsx              # Login page
│  │  ├─ register/page.tsx           # Registration page
│  │  ├─ verify-email/page.tsx       # "check your inbox" screen
│  │  ├─ auth/callback/route.ts      # OAuth + email-confirmation redirect handler
│  │  ├─ dashboard/page.tsx          # Dashboard (list of companies)
│  │  ├─ company/new/page.tsx        # Company creation page
│  │  ├─ company/[id]/upload/page.tsx# File upload page
│  │  └─ api/
│  │     ├─ companies/route.ts       # Create/list companies
│  │     └─ upload/
│  │        ├─ presign/route.ts      # Issues a presigned R2 PUT URL
│  │        └─ confirm/route.ts      # Saves file metadata after upload
│  ├─ components/                    # LoginForm, RegisterForm, CompanyForm, FileUploader, Navbar…
│  ├─ lib/
│  │  ├─ supabase/{client,server,middleware}.ts
│  │  └─ r2.ts                       # R2 client + presigned URL helpers
│  ├─ types/index.ts                 # Shared types + accepted file types
│  └─ middleware.ts                  # Route protection + email-verification gate
├─ supabase/schema.sql                # Tables, indexes, RLS policies
├─ wrangler.jsonc / open-next.config.ts# Cloudflare Worker deployment config
└─ .env.example
```

---

## 3. Prerequisites

* Node.js 20+
* A [Supabase](https://supabase.com) project
* A [Cloudflare](https://dash.cloudflare.com) account with R2 enabled
* Google Cloud OAuth credentials (Web application)
* Microsoft Entra ID (Azure AD) app registration

---

## 4. Supabase setup

1. **Create a project** at supabase.com.
2. **Run the schema** — open SQL Editor and run the contents of `supabase/schema.sql`.
   This creates `companies` and `files` tables with row-level security so users can
   only see their own data.
3. **Enable email confirmation** — Authentication → Providers → Email →
   turn on "Confirm email". This is what powers the email-verification step.
4. **Enable Google** — Authentication → Providers → Google → paste your Google OAuth
   Client ID/Secret. Add this Redirect URL in the Google Cloud Console:
   `https://YOUR-PROJECT.supabase.co/auth/v1/callback`
5. **Enable Microsoft (Azure)** — Authentication → Providers → Azure → paste your
   Entra ID Application (client) ID/Secret and Tenant URL. Add the same pattern of
   redirect URL from your Entra app registration:
   `https://YOUR-PROJECT.supabase.co/auth/v1/callback`
6. **Set the Site URL & Redirect URLs** — Authentication → URL Configuration:
   * Site URL: `http://localhost:3000` (dev) / your production URL
   * Redirect URLs: add `http://localhost:3000/auth/callback` and
     `https://your-production-domain/auth/callback`
7. Copy your **Project URL**, **anon key**, and **service role key** from
   Project Settings → API into your `.env.local`.

---

## 5. Cloudflare R2 setup

1. Dashboard → R2 → **Create bucket**, e.g. `nevinfotech-portal`. Keep it **private**
   (no public access) — the app uses presigned URLs for both upload and retrieval.
2. R2 → **Manage R2 API Tokens** → create a token with **Object Read & Write**
   permissions scoped to that bucket. Note the **Access Key ID**, **Secret Access Key**,
   and your **Account ID**.
3. Your S3-compatible endpoint is:
   `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`
4. **CORS** — since the browser uploads directly to R2 with a presigned URL, add a CORS
   policy on the bucket (R2 → bucket → Settings → CORS Policy):

   ```json
   [
     {
       "AllowedOrigins": ["http://localhost:3000", "https://your-production-domain"],
       "AllowedMethods": ["PUT", "GET"],
       "AllowedHeaders": ["*"],
       "MaxAgeSeconds": 3000
     }
   ]
   ```

---

## 6. Environment variables

Copy `.env.example` to `.env.local` and fill in every value:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_ENDPOINT=
R2_PUBLIC_BASE_URL=

NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`SUPABASE_SERVICE_ROLE_KEY` and all `R2_*` secrets are **server-only** — never prefix
them with `NEXT_PUBLIC_`.

---

## 7. Local installation

```bash
# 1. Install dependencies
npm install

# 2. Add environment variables
cp .env.example .env.local
# then edit .env.local with your real values

# 3. Run the dev server
npm run dev
```

Visit `http://localhost:3000` — you'll land on `/login`.

**Test the flow:**
1. Register with email/password → check inbox → click the verification link.
2. Sign in → you'll reach `/dashboard`.
3. Click "New company" → enter a name → a row is created in `companies` and you're
   routed to `/company/{id}/upload`.
4. Drag in a PDF/DOCX/XLSX/PNG/JPG → it uploads directly to
   `companies/{company-id}/` in R2, and a row appears in `files`.

---

## 8. GitHub deployment instructions

```bash
# From inside the project folder
git init
git add .
git commit -m "Initial commit: NevInfotech Portal"

# Create a new repo on GitHub first, then:
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/nevinfotech-portal.git
git push -u origin main
```

`.env.local` is already excluded via `.gitignore` — never commit real secrets.

---

## 9. Deploying to Cloudflare

Next.js 15's App Router (Server Components, Route Handlers, middleware) runs on Cloudflare
via the **OpenNext Cloudflare adapter** (`@opennextjs/cloudflare`). As of the current
adapter version, this deploys your app as a single **Cloudflare Worker with a static
assets binding** — not a classic Cloudflare Pages project. Wrangler's `deploy` command
handles both the server code and the static assets in one step, so there's no separate
"Pages build output directory" setting to configure.

Required versions: **Node.js 20+**, **Wrangler 3.99.0+** (this project pins `^4.0.0`),
and **`@opennextjs/cloudflare` 1.x** (older `0.x` releases used a different,
non-subcommand CLI and are not compatible with these instructions).

### Option A — CLI deploy

```bash
npm install -g wrangler
wrangler login

# Builds the Next.js app with OpenNext, then deploys the Worker + assets
npm run deploy
```

Other useful scripts (already in `package.json`):

```bash
npm run preview     # Build, then run it locally in the real Workers runtime
npm run upload       # Build, then upload a new Worker *version* without making it live
                      # (use this for non-production/preview branches; promote later
                      # via Gradual Deployments in the dashboard)
npm run cf-typegen   # Generate cloudflare-env.d.ts with types for your bindings
```

Before your first deploy, set the secrets the Worker needs (anything not safe to
commit — everything from `.env.example` except `NEXT_PUBLIC_SITE_URL`):

```bash
wrangler secret put NEXT_PUBLIC_SUPABASE_URL
wrangler secret put NEXT_PUBLIC_SUPABASE_ANON_KEY
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
wrangler secret put R2_ACCOUNT_ID
wrangler secret put R2_ACCESS_KEY_ID
wrangler secret put R2_SECRET_ACCESS_KEY
wrangler secret put R2_BUCKET_NAME
wrangler secret put R2_ENDPOINT
wrangler secret put R2_PUBLIC_BASE_URL
```

Update the `vars.NEXT_PUBLIC_SITE_URL` value in `wrangler.jsonc` to your real
`*.workers.dev` URL (or custom domain) once you know it.

### Option B — Connect the GitHub repo (Workers Builds)

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Workers** →
   **Connect to Git** (this is "Workers Builds" — the current CI path for full-stack
   Next.js apps; it replaces the older Pages "Git integration" flow for this use case).
2. Select your `nevinfotech-portal` repo.
3. Build settings:
   * Build command: `npm run deploy` (this runs `opennextjs-cloudflare build` then
     `opennextjs-cloudflare deploy` for you)
   * Deploy command: leave as the default (`npx wrangler deploy`), since `npm run deploy`
     already builds and deploys in one step — or set Build command to `npm run build`
     only and let the dashboard's own Deploy command run `wrangler deploy` separately.
4. Add every variable from `.env.example` under **Settings → Variables and Secrets**.
   Mark the service-role key and all `R2_*` values as **Secret** (encrypted).
5. Trigger a deploy. Cloudflare rebuilds on every push to `main`.

### After first deploy

* Update Supabase **Site URL** and **Redirect URLs** to your `*.workers.dev` (or custom)
  domain.
* Update the R2 bucket CORS policy to include that same production domain.
* If you see `ERROR Could not find compiled Open Next config, did you run the build
  command?` during deploy, it means the deploy step ran without first running the
  OpenNext build — make sure your dashboard "Build command" actually runs
  `opennextjs-cloudflare build` (or use `npm run deploy`, which chains build + deploy).

---

## 10. Accepted file types & limits

| Type | MIME type |
|------|-----------|
| PDF  | `application/pdf` |
| DOCX | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` |
| XLSX | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` |
| PNG  | `image/png` |
| JPG  | `image/jpeg` |

Max file size: 25 MB (configurable in `src/types/index.ts`).

---

## 11. Security notes

* Row-level security in `supabase/schema.sql` ensures a user can only read/write
  companies and files they own.
* The R2 bucket stays private; all access goes through short-lived presigned URLs
  generated server-side, after verifying the requesting user owns the company.
* The service-role Supabase key is only used in trusted server contexts and is never
  sent to the browser.
