// Deploy this script to Cloudflare Workers.
// Add your OpenWeatherMap key as a secret named OPENWEATHERMAP_API_KEY
// via: wrangler secret put OPENWEATHERMAP_API_KEY
// or via the Cloudflare dashboard → Workers → your worker → Settings → Variables → Secret.

const ALLOWED_ORIGIN = "https://chininchu.github.io";

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    const url = new URL(request.url);
    const lat = url.searchParams.get("lat");
    const lon = url.searchParams.get("lon");

    if (!lat || !lon) {
      return new Response(
        JSON.stringify({ error: "lat and lon are required" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
          },
        }
      );
    }

    const apiUrl =
      `https://api.openweathermap.org/data/2.5/forecast` +
      `?lat=${lat}&lon=${lon}&appid=${env.OPENWEATHERMAP_API_KEY}&units=metric`;

    const upstream = await fetch(apiUrl);
    const data = await upstream.json();

    return new Response(JSON.stringify(data), {
      status: upstream.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      },
    });
  },
};
