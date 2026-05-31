# Current Setup

## Cloudflare Worker Proxy

- **Worker name:** `open-meteo-proxy`
- **URL:** `https://open-meteo-proxy.paragliding-forecast.workers.dev`
- **Account subdomain:** `paragliding-forecast.workers.dev`
- **Cloudflare dashboard:** [dash.cloudflare.com](https://dash.cloudflare.com) → Workers & Pages → open-meteo-proxy
- **Wrangler version used to deploy:** 3.114.17

The worker forwards GET requests to `api.open-meteo.com`, caches responses for 30 minutes at the edge, and adds CORS headers.

To redeploy after changes:
```bash
cd open-meteo-proxy
npx wrangler deploy
```

## Google Apps Script

- **File:** `paragliding_forecast.js`
- **Recipient:** your email (set in `RECIPIENT_EMAILS` in the script)
- **Timezone:** `America/Los_Angeles`
- **`WEATHER_API_BASE`:** `https://open-meteo-proxy.paragliding-forecast.workers.dev`

### Active Sites

| Site | Lat | Lon | Wind Direction |
|------|-----|-----|----------------|
| Mussel Rock | 37.67 | -122.49 | 225°–330° |

### Commented-out Sites (ready to enable)

- Blue Rock (38.1379, -122.195) — 210°–300°
- Ed Levin 1750ft (37.4754, -121.8613) — 210°–300°
- Ed Levin 600ft (37.4615, -121.8645) — 210°–300°

### Global Defaults

| Setting | Value |
|---------|-------|
| Min speed | 8 mph |
| Max speed | 15 mph |
| Gust spread | 8 mph |
| Hours | 9 AM – 6 PM local |
| Debug logging | off |
