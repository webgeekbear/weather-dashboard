var appid = "&appid=1353e67f03e4a02c4d6d35efc4c2e994";
var nonid = "&appid=43307f36c133c1b4d80feb3644b2ab3e"; // Instructor's app ID (just in case)

function getLocationData(city) {
    // Use this call to get the latitude and longitude of the city.  This is required by the one call api.
    let apiUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + city + appid + "&units=imperial";

    fetch(apiUrl)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            getOneCallData(city, data.coord.lat, data.coord.lon);
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
}

function getIconLocation(icon, size) {
    if (size === undefined) {
        size = "";
    }

    return "http://openweathermap.org/img/wn/" + icon + size + ".png";
}