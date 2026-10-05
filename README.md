# Product Management - React frontend

Login -> Product list -> Add / Edit / Delete -> Logout. Talks only to the LavaLust API (never to the database).

## Run locally
```
npm install
cp .env.example .env     # set VITE_API_URL to your API (local or Render)
npm run dev              # http://localhost:5173
```
If the API runs locally, set `ALLOWED_ORIGIN=http://localhost:5173` in the API `.env`.

## Deploy
- Build command: `npm install && npm run build`
- Publish directory: `dist`
- Set `VITE_API_URL` in Vercel to the deployed LavaLust API origin, for example `https://catapang-alvin-james-lavalust.onrender.com`.
- Set `ALLOWED_ORIGIN` in the API service to the deployed frontend origin, for example `https://catapang-product-frontend.vercel.app`.
- Configure `JWT_SECRET` and `REFRESH_TOKEN_KEY` as separate random secrets in the API service, then redeploy both services after code changes.

## How auth works
`api.js` stores the access + refresh tokens, adds `Authorization: Bearer ...` to each request, and when the 15-minute
access token expires it calls `/api/refresh` once and retries automatically.
