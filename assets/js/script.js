var appid = "&appid=1353e67f03e4a02c4d6d35efc4c2e994"; // App ID for Open weather API

var cities = [];

loadCities();

function saveCities() {
    localStorage.setItem("cities", JSON.stringify(cities));
}

function loadCities() {
    cities = JSON.parse(localStorage.getItem("cities"));
    if (!cities) {
        cities = [];
    }

    displayCityButtons();
}

function addCityButton(city) {
    // If city not found in array
    if (cities.indexOf(city) === -1) {
        cities.unshift(city); // Add it at beginning
    }

    if (cities.length > 10) {
        for (let i = 10; i < cities.length; i++) {
            cities.pop(); // Remove the last city
        }
    }

    saveCities();
    displayCityButtons();
}

function displayCityButtons() {
    let cityButtonsEl = $("#city-buttons");
    cityButtonsEl.html(""); // Remove any existing buttons

    for (let i = 0; i < cities.length; i++) {
        let newButton = $("<button>");
        newButton.html(cities[i]);
        newButton.attr("data-city", cities[i]);
        newButton.addClass("btn");
        newButton.addClass("dark");

        cityButtonsEl.append(newButton);
    }
}

function getLocationData(city) {
    // Use this call to get the latitude and longitude of the city.  This is required by the one call api.
    let apiUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + city + appid + "&units=imperial";

    fetch(apiUrl)
        .then(function (response) {
            if (response.ok) {
                return response.json();
            }
            return null;
        })
        .then(function (data) {
            if (data) {
                getOneCallData(city, data.coord.lat, data.coord.lon);
                addCityButton(city);
            } else {
                swal("Error", "Could not find a city named \"" + city + "\"", "error");
            }
        });
}

function getOneCallData(city, lat, lon) {
    // This API should have all relevant data for the app.  
    // Just need the latitude and longitude from the other API.
    let apiUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=current,minute,hourly,alerts" + appid + "&units=imperial";
    fetch(apiUrl)
        .then(function (response) {
            if (response.ok) {
                return response.json();
            }
            return null;
        })
        .then(function (data) {
            if (data) {
                formatOneCallData(city, data);
            } else {
                swal("Error", "Cannot connect to the internet.");
            }
        });
}

function formatDate(date) {
    // The date provided by the API is # of seconds since epoch
    // We need # of microseconds and to format it properly
    return moment(date * 1000).format("M/D/YY")
}

function formatHeaderPanel(city, data) {
    let cityContainerEl = $("#city-container");
    cityContainerEl.html("");

    let cityCardEl = $("<div>");
    cityCardEl.addClass("card");

    // Display city header info (city name, date, weather icon)
    let cityInfoEl = $("<h3>");
    cityInfoEl.attr("id", "city-info");
    cityInfoEl.addClass("card-header");
    cityInfoEl.text(city + " (" + formatDate(data.dt) + ")");

    let citySpanEl = $("<span>");
    let cityIconEl = $("<img>");
    cityIconEl.attr("src", getIconLocation(data.weather[0].icon, "@2x"));

    citySpanEl.append(cityIconEl);
    cityInfoEl.append(citySpanEl);
    cityCardEl.append(cityInfoEl);

    // display temperature
    let cityTempEl = $("<div>");
    cityTempEl.attr("id", "city-temp");
    cityTempEl.html("Temp: " + data.temp.max + "&deg;F");
    cityCardEl.append(cityTempEl);

    // display wind speed
    let cityWindEl = $("<div>");
    cityWindEl.attr("id", "city-wind");
    cityWindEl.html("Wind: " + data.wind_speed + " MPH");
    cityCardEl.append(cityWindEl);

    // Display humidity
    let cityHumidEl = $("<div>");
    cityHumidEl.attr("id", "city-humid");
    cityHumidEl.html("Humidity: " + data.humidity + "%");
    cityCardEl.append(cityHumidEl);

    let cityUviEl = $("<div>");
    cityUviEl.attr("id", "city-uvi");
    cityUviEl.html("UV Index: ");

    let uviTextClass = "";
    if (data.uvi < 3) {
        uviTextClass = "bg-success";
    } else if (data.uvi >= 3 && data.uvi < 6) {
        uviTextClass = "bg-warning";
    } else {
        uviTextClass = "bg-danger";
    }

    let uviSpanEl = $("<span>");
    uviSpanEl.html(data.uvi);
    uviSpanEl.addClass(uviTextClass);
    cityUviEl.append(uviSpanEl);

    cityCardEl.append(cityUviEl);

    cityContainerEl.append(cityCardEl);

    let headerForecastEl = $("<h3>");
    headerForecastEl.html("5-day forecast");

    let headerRowEl = $("<div>");
    headerRowEl.attr("id", "forecast");
    headerRowEl.addClass("row");
    headerForecastEl.append(headerRowEl);

    cityContainerEl.append(headerForecastEl);
}

function formatOneCallData(city, data) {
    formatHeaderPanel(city, data.daily[0]);

    // Display 5-day forecast
    let forecastEl = $("#forecast");
    forecastEl.html(""); // Clear out the old info
    if (!forecastEl.hasClass("row")) {
        forecastEl.addClass("row");
    }

    for (let i = 1; i < 6; i++) {
        let containerEl = $("<div>");
        containerEl.addClass("col-2");

        let cardEl = $("<div>");
        cardEl.addClass("card");
        cardEl.addClass("dark");

        let dateEl = $("<div>");
        dateEl.html(formatDate(data.daily[i].dt));
        dateEl.addClass("card-header");
        dateEl.addClass("shrink");
        cardEl.append(dateEl);

        let iconEl = $("<img>");
        iconEl.attr("src", getIconLocation(data.daily[i].weather[0].icon, "@2x"));
        iconEl.addClass("shrink-icon");
        cardEl.append(iconEl);

        let tempEl = $("<div>");
        tempEl.html("Temp: " + data.daily[i].temp.max + "&deg;F");
        tempEl.addClass("shrink");
        cardEl.append(tempEl);

        let windEl = $("<div>");
        windEl.html("Wind: " + data.daily[i].wind_speed + " MPH");
        windEl.addClass("shrink");
        cardEl.append(windEl);

        let humidEl = $("<div>");
        humidEl.html("Humidity: " + data.daily[i].humidity + "%");
        humidEl.addClass("shrink");
        cardEl.append(humidEl);

        containerEl.append(cardEl);
        forecastEl.append(containerEl);
    }
}

function getIconLocation(icon, size) {
    if (size === undefined) {
        size = "";
    }

    return "http://openweathermap.org/img/wn/" + icon + size + ".png";
}

$("#user-form").on("submit", function (event) {
    event.preventDefault();

    let cityEl = $("#city");
    let city = cityEl.val().trim();
    cityEl.val(""); // Clear out city information
    if (city) {
        getLocationData(city);
    } else {
        swal("Error", "Please enter a city name.", "error");
    }
});

$("#city-buttons").on("click", function (event) {
    let city = $(event.target).attr("data-city");
    if (city) {
        getLocationData(city);
    }
});