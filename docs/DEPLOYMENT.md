# Deployment Guide

## Supabase

1. Create a Supabase project.
2. Copy the Postgres connection string.
3. Put that value into Render as `DATABASE_URL`.
4. Run Prisma migrations before going live.

## Render backend

This repo includes `render.yaml` for `apps/api`.

Set:

- `DATABASE_URL`
- `AUTH0_DOMAIN`
- `AUTH0_AUDIENCE`
- `AUTH0_ISSUER_BASE_URL`
- `FRONTEND_ORIGIN`
- `PORT`

Build/start flow:

```bash
npm install
npm run prisma:generate
npm run build
npm run start
```

Optionally run:

```bash
npm run prisma:deploy
```

before starting the service.

## Cloudflare Workers frontend

Deploy from `apps/web`.

Set:

- `VITE_AUTH0_DOMAIN`
- `VITE_AUTH0_CLIENT_ID`
- `VITE_AUTH0_AUDIENCE`
- `VITE_API_BASE_URL`

Build/deploy:

```bash
npm install
npm run build
npx wrangler deploy
```

## Final production checklist

1. Update Auth0 callback, logout, and web origin URLs to the deployed frontend URL.
2. Set Render `FRONTEND_ORIGIN` to that same frontend URL.
3. Confirm CORS and login work.
4. Test with two users in the same family group.
5. Verify the target user does not receive hidden markets from `GET /api/markets`.
