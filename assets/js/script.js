var appid = "&appid=1353e67f03e4a02c4d6d35efc4c2e994";
var nonid = "&appid=43307f36c133c1b4d80feb3644b2ab3e"; // Instructor's app ID (just in case)

var cities = [];

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
        newButton.addClass("btn-primary");

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
                alert("Could not find \"" + city + "\"");
                // let cityEl = $("#city");
                // let textEl = $("<p>");
                // textEl.val("Could not find " + city);
                // cityEl.append(textEl);
                // setTimeout(function () {
                //     textEl.remove();
                // }, 1 * 1000);
            }
        })
        .catch(function (error) {
            alert(error.message);
        });
}

function getOneCallData(city, lat, lon) {
    // This API should have all relevant data for the app.  
    // Just need the latitude and longitude from the other API.
    let apiUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=current,minute,hourly,alerts" + appid + "&units=imperial";
    fetch(apiUrl)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            formatOneCallData(city, data);
        })
        .catch(function (error) {
            alert(error.message);
        });
}

function formatDate(date) {
    // The date provided by the API is # of seconds since epoch
    // We need # of microseconds and to format it properly
    return moment(date * 1000).format("M/D/YY")
}

function formatHeaderPanel(city, data) {
    // Display city header info (city name, date, weather icon)
    let cityInfoEl = $("#city-info");
    cityInfoEl.text(city + " (" + formatDate(data.dt) + ")");
    let citySpanEl = $("<span>");
    let cityIconEl = $("<img>");
    cityIconEl.attr("src", getIconLocation(data.weather[0].icon, "@2x"));
    citySpanEl.append(cityIconEl);
    cityInfoEl.append(citySpanEl);

    // Display city temp
    let cityTempEl = $("#city-temp");
    cityTempEl.html("Temp: ");
    let tempSpanEl = $("<span>");
    tempSpanEl.html(data.temp.max + "&deg;F");
    cityTempEl.append(tempSpanEl);

    // display wind speed
    let cityWindEl = $("#city-wind");
    cityWindEl.html("Wind: ");

    let windSpanEl = $("<span>");
    windSpanEl.html(data.wind_speed + " MPH");
    cityWindEl.append(windSpanEl);

    // Display humidity
    let cityHumidEl = $("#city-humid");
    cityHumidEl.html("Humidity: ");

    let humidSpanEl = $("<span>");
    humidSpanEl.html(data.humidity + "%");
    cityHumidEl.append(humidSpanEl);

    // Display UVI
    let cityUviEl = $("#city-uvi");
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
        cardEl.addClass("bg-dark");

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

var userFormEl = document.getElementById("user-form");
var cityEl = document.getElementById("city");

$("#user-form").on("submit", function (event) {
    event.preventDefault();

    let locEl = $("#city");
    let loc = locEl.val();
    locEl.val(""); // Clear out city information
    getLocationData(loc);
});

$("#city-buttons").on("click", function (event) {
    let city = $(event.target).attr("data-city");
    getLocationData(city);
});