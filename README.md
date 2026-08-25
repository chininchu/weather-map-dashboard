# Weather Map Dashboard

A weather dashboard that lets users search for a city or use their current location to view current conditions and a four-day forecast on an interactive map.

## Live Project

[Open the live Weather Map Dashboard](https://soft-maamoul-084374.netlify.app)

## Features

- Search for weather by city
- Use the browser's current location
- View current temperature, wind, humidity, and conditions
- View a four-day forecast
- Display the selected location on a Mapbox map
- Run the Express app through a Netlify Function

## Run Locally

Install dependencies:

```bash
npm install
```

Create a `.env` file in the project root:

```env
OPENWEATHERMAP_API_KEY=your_openweathermap_api_key
MAPBOX_TOKEN=your_mapbox_token
```

Start the development server:

```bash
npm run dev
```

Then open `http://localhost:3000`.

## Deployment

The app uses Netlify Functions to run the Express server. Add these environment variables in Netlify site settings:

- `OPENWEATHERMAP_API_KEY`
- `MAPBOX_TOKEN`

Do not commit `.env` or expose the OpenWeatherMap key in browser code. The key is used by the server when it requests forecast data.

## Technology

- Node.js and Express
- ES modules
- Pug templates
- Netlify Functions
- OpenWeatherMap API
- Mapbox API
