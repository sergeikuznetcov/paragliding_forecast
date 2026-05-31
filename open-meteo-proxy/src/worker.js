/**
 * Cloudflare Worker - Open-Meteo reverse proxy.
 *
 * Forwards requests to api.open-meteo.com so that Apps Script
 * traffic comes from the Worker's IP instead of Google's shared pool.
 *
 * Deploy:  npx wrangler deploy
 * Test:    curl "https://open-meteo-proxy.<you>.workers.dev/v1/forecast?latitude=37.67&longitude=-122.49&hourly=wind_speed_10m&models=gfs_hrrr&wind_speed_unit=mph"
 */

const UPSTREAM = "https://api.open-meteo.com";

export default {
  async fetch(request) {
    const incomingUrl = new URL(request.url);

    // Only allow GET - nothing else is needed for weather reads.
    if (request.method !== "GET") {
      return new Response("Method not allowed", { status: 405 });
    }

    // Build the upstream URL, preserving path + query string.
    const target = `${UPSTREAM}${incomingUrl.pathname}${incomingUrl.search}`;

    try {
      const upstream = await fetch(target, {
        headers: {
          "User-Agent": "open-meteo-proxy-worker",
          "Accept": "application/json",
        },
      });

      // Pass through the status and body from Open-Meteo.
      return new Response(upstream.body, {
        status: upstream.status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=1800",   // cache 30 min at the edge
        },
      });
    } catch (err) {
      return new Response(
        JSON.stringify({ error: true, reason: err.message }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }
  },
};
