# Bay Area Paragliding Forecast

Daily email alerts when flyable wind windows exist, powered by the [HRRR](https://rapidrefresh.noaa.gov/hrrr/) high-resolution weather model via [Open-Meteo](https://open-meteo.com).

## How It Works

A Google Apps Script runs on a daily trigger, fetches hourly HRRR wind forecasts for configured flying sites, and sends an email when conditions are flyable — right wind direction, speed in range, and gusts not too punchy.

## Project Structure

```
paragliding_forecast/
├── paragliding_forecast.js        # Google Apps Script (copy into your project)
├── README.md
├── SETUP.md                       # Deployment details for this instance
└── open-meteo-proxy/              # Cloudflare Worker proxy
    ├── package.json
    ├── wrangler.toml
    └── src/
        └── worker.js
```

## Setup

### 1. Deploy the Cloudflare Worker (recommended)

Google Apps Script runs on shared IPs, which often hit Open-Meteo's daily rate limit (HTTP 429). The Cloudflare Worker proxies requests through a dedicated IP.

**Option A — Wrangler CLI:**

```bash
cd open-meteo-proxy
npm install
npx wrangler login
npx wrangler deploy
```

**Option B — Cloudflare Dashboard:**

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create**
2. Name it `open-meteo-proxy`
3. Click **Deploy**, then **Edit Code**
4. Paste the contents of `open-meteo-proxy/src/worker.js`
5. Click **Deploy**

Either way, note the deployed URL (e.g. `https://open-meteo-proxy.your-subdomain.workers.dev`).

### 2. Configure the Apps Script

1. Open [script.google.com](https://script.google.com) and create a new project
2. Paste the contents of `paragliding_forecast.js`
3. Update `WEATHER_API_BASE` in the `CONFIG` object with your Worker URL
4. Set `appsscript.json` timezone: `"timeZone": "America/Los_Angeles"`
5. Add a daily trigger: **Triggers** → **Add Trigger** → `dailyParaglidingReport` → **Time-driven** → **Day timer**

## Configuration

All tuning lives in the `CONFIG` object at the top of `paragliding_forecast.js`:

| Setting | Default | Description |
|---------|---------|-------------|
| `RECIPIENT_EMAILS` | — | Who gets the email |
| `WEATHER_API_BASE` | — | Cloudflare Worker URL (or `https://api.open-meteo.com` direct) |
| `minSpd` | 8 mph | Minimum flyable wind speed |
| `maxSpd` | 15 mph | Maximum flyable wind speed |
| `gustSpread` | 8 mph | Max gust-minus-speed before "too punchy" |
| `hourStart` | 9 | Earliest local hour to consider |
| `hourEnd` | 18 | Latest local hour to consider |
| `DEBUG` | false | Log rejection reasons for each hour |

### Adding a site

Uncomment or add an entry in `CONFIG.SITES`:

```javascript
{
    name: "Site Name",
    lat: 37.00, lon: -122.00,
    minDir: 210, maxDir: 300,        // acceptable wind direction range
    link: "https://www.windy.com/...",  // Windy link for the email
    nav: "https://www.google.com/maps/dir/..."  // Google Maps directions
}
```

Per-site overrides (e.g. `minSpd`, `maxSpd`) can be added to any site object.
