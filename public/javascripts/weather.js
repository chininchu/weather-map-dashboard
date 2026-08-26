"use strict";

function formatDate(timestamp, timezone) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone ? "UTC" : undefined,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date((timestamp + (timezone || 0)) * 1000));
}

document.addEventListener("DOMContentLoaded", function () {
  const searchForm = document.getElementById("searchForm");
  const cityInput = document.getElementById("cityInput");
  const currentLocationBtn = document.getElementById("currentLocationBtn");
  const status = document.getElementById("status");
  let map;
  let marker;

  // City searches use Mapbox to turn a name into coordinates.
  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const city = cityInput.value.trim();
    if (city) {
      geocodeCity(city);
    }
  });

  // Location-based searches use the browser's geolocation API directly.
  currentLocationBtn.addEventListener("click", function () {
    if ("geolocation" in navigator) {
      setStatus("Finding your location...");
      navigator.geolocation.getCurrentPosition(
        function (position) {
          getWeatherData(position.coords.latitude, position.coords.longitude);
        },
        function () {
          setStatus(
            "We could not access your location. Check browser permissions and try again.",
            true,
          );
        },
      );
    } else {
      setStatus("Geolocation is not supported by this browser.", true);
    }
  });

  function geocodeCity(city) {
    if (!mapboxToken) {
      setStatus(
        "City search is not configured. Use current location instead.",
        true,
      );
      return;
    }
    setStatus("Finding that city...");
    const geocodingUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      city,
    )}.json?access_token=${mapboxToken}`;

    fetch(geocodingUrl)
      .then((response) => {
        if (!response.ok) throw new Error("City search failed");
        return response.json();
      })
      .then((data) => {
        if (data.features && data.features.length > 0) {
          const [lng, lat] = data.features[0].center;
          getWeatherData(lat, lng);
        } else {
          setStatus("City not found. Try a nearby city or region.", true);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        setStatus("We could not search for that city. Please try again.", true);
      });
  }

  function getWeatherData(lat, lon) {
    setStatus("Loading weather...");
    fetch(`/weather?lat=${lat}&lon=${lon}`)
      .then((response) => {
        return response.json().then((data) => {
          if (!response.ok)
            throw new Error(data.error || "Weather request failed");
          return data;
        });
      })
      .then((data) => {
        displayWeather(data);
        updateMap(lat, lon);
      })
      .catch((error) => {
        console.error("Error:", error);
        setStatus(error.message || "We could not load weather data.", true);
      });
  }

  function displayWeather(data) {
    if (!data.city || !Array.isArray(data.list) || !data.list.length) {
      throw new Error("Weather data is unavailable for this location");
    }
    const current = data.list[0];
    const cityName = data.city.name;
    const date = formatDate(current.dt, data.city.timezone);
    const currentWeather = document.getElementById("currentWeather");
    currentWeather.replaceChildren(
      weatherDetails(`${cityName} (${date})`, current),
    );

    const forecast = data.list.slice(1).filter((item) => item?.weather?.[0]);
    const days = [
      ...new Map(
        forecast.map((item) => [formatDate(item.dt, data.city.timezone), item]),
      ).values(),
    ].slice(0, 4);
    const forecastContainer = document.querySelector(".forecast-container");
    forecastContainer.replaceChildren(
      ...days.map((day) => {
        const card = document.createElement("div");
        card.className = "forecast-day";
        card.append(
          weatherDetails(formatDate(day.dt, data.city.timezone), day),
        );
        return card;
      }),
    );
    setStatus(`Weather updated for ${cityName}.`);
  }

  function weatherDetails(title, weather) {
    const details = document.createElement("div");
    const heading = document.createElement("h2");
    heading.textContent = title;
    const icon = document.createElement("img");
    icon.className = "weather-icon";
    icon.src = `https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`;
    icon.alt = weather.weather[0].description;
    details.append(heading, icon);
    [
      `Temperature: ${weather.main.temp}°C`,
      `Feels like: ${weather.main.feels_like}°C`,
      `Wind: ${weather.wind.speed} M/S`,
      `Humidity: ${weather.main.humidity}%`,
      weather.weather[0].description,
    ].forEach((text) => {
      const paragraph = document.createElement("p");
      paragraph.textContent = text;
      details.append(paragraph);
    });
    return details;
  }

  function updateMap(lat, lon) {
    if (!mapboxToken || !window.mapboxgl) return;
    if (!map) {
      mapboxgl.accessToken = mapboxToken;
      map = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/streets-v12",
        center: [lon, lat],
        zoom: 9,
      });
    } else {
      map.flyTo({ center: [lon, lat], zoom: 9 });
    }
    if (marker) marker.setLngLat([lon, lat]);
    else marker = new mapboxgl.Marker().setLngLat([lon, lat]).addTo(map);
  }

  function setStatus(message, isError) {
    status.textContent = message;
    status.classList.toggle("error", Boolean(isError));
  }
});
