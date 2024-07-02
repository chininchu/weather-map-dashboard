var express = require("express");
var router = express.Router();
var axios = require("axios");

const OPENWEATHERMAP_API_KEY = process.env.OPENWEATHERMAP_API_KEY;
const OPENWEATHERMAP_API_URL =
  "https://api.openweathermap.org/data/2.5/forecast";

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", {
    title: "Weather Map",
    mapboxToken: process.env.MAPBOX_TOKEN,
  });
});

router.get("/weather", async function (req, res, next) {
  const { lat, lon } = req.query;
  if (!lat || !lon) {
    return res
      .status(400)
      .json({ error: "Latitude and longitude are required" });
  }

  try {
    const response = await axios.get(OPENWEATHERMAP_API_URL, {
      params: {
        lat: lat,
        lon: lon,
        appid: OPENWEATHERMAP_API_KEY,
        units: "metric",
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error(
      "Error fetching weather data:",
      error.response ? error.response.data : error.message
    );
    res
      .status(500)
      .json({ error: "Failed to fetch weather data", details: error.message });
  }
});

module.exports = router;
