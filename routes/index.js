"use strict";

import express from "express";
import axios from "axios";

const router = express.Router();

const OPENWEATHERMAP_API_KEY = process.env.OPENWEATHERMAP_API_KEY;
const OPENWEATHERMAP_API_URL =
  "https://api.openweathermap.org/data/2.5/forecast";

// Render the dashboard and provide the browser with its Mapbox token.
router.get("/", function (req, res, next) {
  res.render("index", {
    title: "Weather Map",
    mapboxToken: process.env.MAPBOX_TOKEN,
  });
});

router.get("/weather", async function (req, res, next) {
  const { lat, lon } = req.query;
  const latitude = Number(lat);
  const longitude = Number(lon);

  // Validate coordinates before making an external API request.
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return res
      .status(400)
      .json({ error: "Valid latitude and longitude are required" });
  }

  if (!OPENWEATHERMAP_API_KEY) {
    return res.status(503).json({ error: "Weather service is not configured" });
  }

  // Keep the OpenWeatherMap key on the server; the browser only receives data.
  try {
    const response = await axios.get(OPENWEATHERMAP_API_URL, {
      params: {
        lat: latitude,
        lon: longitude,
        appid: OPENWEATHERMAP_API_KEY,
        units: "metric",
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error(
      "Error fetching weather data:",
      error.response ? error.response.data : error.message,
    );
    res.status(502).json({ error: "Failed to fetch weather data" });
  }
});

export default router;
