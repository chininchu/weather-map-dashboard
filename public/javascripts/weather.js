document.addEventListener("DOMContentLoaded", function () {
  const searchBtn = document.getElementById("searchBtn");
  const cityInput = document.getElementById("cityInput");
  const currentLocationBtn = document.getElementById("currentLocationBtn");

  searchBtn.addEventListener("click", function () {
    const city = cityInput.value;
    if (city) {
      geocodeCity(city);
    }
  });

  currentLocationBtn.addEventListener("click", function () {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(

        

        function (position)  {
          getWeatherData(position.coords.latitude, position.coords.longitude);
        },
        function (error) {
          alert("Error: " + error.message);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  });

  function geocodeCity(city) {
    const geocodingUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      city
    )}.json?access_token=${mapboxToken}`;

    fetch(geocodingUrl)
      .then((response) => response.json())
      .then((data) => {
        if (data.features && data.features.length > 0) {
          const [lng, lat] = data.features[0].center;
          getWeatherData(lat, lng);
        } else {
          alert("City not found");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Error geocoding city: " + error.message);
      });
  }

  function getWeatherData(lat, lon) {
    fetch(`/weather?lat=${lat}&lon=${lon}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        displayWeather(data);
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Error fetching weather data: " + error.message);
      });
  }

  function displayWeather(data) {
    const current = data.list[0];
    const cityName = data.city.name;
    const date = new Date(current.dt * 1000).toISOString().split("T")[0];

    let currentWeatherHtml = `
      <div>
        <h2>${cityName} (${date})</h2>
        <p>Temperature: ${current.main.temp}°C</p>
        <p>Wind: ${current.wind.speed} M/S</p>
        <p>Humidity: ${current.main.humidity}%</p>
      </div>
      <div>
        <img class="weather-icon" src="http://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png" alt="${current.weather[0].description}">
        <p>${current.weather[0].description}</p>
      </div>
    `;

    document.getElementById("currentWeather").innerHTML = currentWeatherHtml;

    let forecastHtml = "";
    for (let i = 1; i <= 4; i++) {
      const day = data.list[i * 8];
      const dayDate = new Date(day.dt * 1000).toISOString().split("T")[0];
      forecastHtml += `
        <div class="forecast-day">
          <h3>${dayDate}</h3>
          <img class="weather-icon" src="http://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="${day.weather[0].description}">
          <p>Temp: ${day.main.temp}°C</p>
          <p>Wind: ${day.wind.speed} M/S</p>
          <p>Humidity: ${day.main.humidity}%</p>
        </div>
      `;
    }

    document.querySelector(".forecast-container").innerHTML = forecastHtml;
  }
});
