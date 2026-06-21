# Vercel deployment

Task 1 UI is a Vite app under `ui/`. Root [`vercel.json`](../vercel.json) builds that folder.

## One-time setup

1. Import GitHub repo `U00A3/redbellyDAO-task1` in [Vercel](https://vercel.com).
2. Framework preset: **Vite** (or Other — config is in `vercel.json`).
3. No root directory override needed; `vercel.json` sets install/build/output.

Contract addresses for production builds are in [`ui/.env.production`](../ui/.env.production) (public testnet addresses).

## Local preview of production build

```bash
npm run ui:build
npm run preview --prefix ui
```

## Environment variables

| Variable | Source |
|----------|--------|
| `VITE_TOKEN_ADDRESS` | `ui/.env.production` |
| `VITE_PERMISSION_CHECKER_ADDRESS` | `ui/.env.production` |

Override in Vercel dashboard only if redeploying to different contracts.
