// Runs the function when the page has loaded
$(document).ready(function () {
    // Sets the API key and search history as global variables
    const APIkey = "f6d668135fc1bf6bf03ce7a428b804f3"
    var history = JSON.parse(localStorage.getItem("history")) || []

    // Displays search history
    $.each(history, function () {
        $("ul").prepend($("<li>", { class: "list-group-item", text: this }))
    })

    // Runs weather and forcast search based on the input value
    $("form").on("submit", function (event) {
        event.preventDefault()
        searchWeather($("input").val())
        searchForecast($("input").val())
    })

    // Runs weather and forcase search based on the city name clicked
    $("ul").on("click", "li", function (event) {
        event.preventDefault()
        searchWeather($(this).text())
        searchForecast($(this).text())
    })

    // Makes ajax request for weather data via city name then publishes onto the page
    function searchWeather(cityInput) {
        $.ajax({
            url: "https://api.openweathermap.org/data/2.5/weather?q=" + cityInput + "&units=imperial&appid=" + APIkey,
            method: "GET"
        }).then(function (city) {
            $("#cityName").text(city.name + moment().format(" (M/D/YYYY) "))
            $("#icon").html($("<img>", {
                src: "https://openweathermap.org/img/wn/" + city.weather[0].icon + ".png",
                alt: city.weather[0].description
            }))
            $("#temp").text(city.main.temp)
            $("#humidity").text(city.main.humidity)
            $("#wind-speed").text(city.wind.speed)
            getUVindex(city.coord.lat, city.coord.lon)

            // Adds city name to the search history if it's new
            if ($.inArray(city.name, history) === -1) {
                $("ul").prepend($("<li>", { class: "list-group-item", text: city.name }))
                history.push(city.name)
                localStorage.setItem("history", JSON.stringify(history))
            }
        })
    }

    // Makes ajax request for forecast data via city name then publishes onto the page
    function searchForecast(cityInput) {
        $.ajax({
            url: "https://api.openweathermap.org/data/2.5/forecast?q=" + cityInput + "&units=imperial&appid=" + APIkey,
            method: "GET"
        }).then(function (city) {
            $(".forecast").empty()
            for (i = 1; i < 6; i++) {
                $(".forecast").append($("<div>", { class: "card bg-primary", id: "forecast" + i }))
                $("#forecast" + i).append($("<div>", { class: "card-body p-2 pr-4", id: i }))
                $("#" + i).append($("<h5>", { class: "card-title", text: moment().add(i, "days").format("M/D/YYYY") }))
                $("#" + i).append($("<img>", {
                    src: "https://openweathermap.org/img/wn/" + city.list[i].weather[0].icon + ".png",
                    alt: city.list[i].weather[0].description
                }))
                $("#" + i).append($("<p>", { class: "card-text", text: "Temp: " + city.list[i].main.temp + String.fromCharCode(32, 176, 70) }))
                $("#" + i).append($("<p>", { class: "card-text", text: "Humidity: " + city.list[i].main.humidity + String.fromCharCode(37) }))
            }
        })
    }

    // Makes ajax request for UV index data via lat and lon values then publishes onto the page
    // Displays a green badge if the UV index is 3 or below
    // Displays a yellow badge if the UV index is between 3 and 8
    // Displays a red badge if the UV index is 8 or above 
    function getUVindex(lat, lon) {
        $.ajax({
            url: "https://api.openweathermap.org/data/2.5/uvi?lat=" + lat + "&lon=" + lon + "&appid=" + APIkey,
            method: "GET"
        }).then(function (uvi) {
            $("#uv-index").text(uvi.value)
            $("#uv-index").attr("class", "rounded px-2 py-1")
            if (uvi.value <= 3.00) {
                $("#uv-index").addClass("badge-success")
            } else if (uvi.value >= 8.00) {
                $("#uv-index").addClass("badge-danger")
            } else {
                $("#uv-index").addClass("badge-warning")
            }
        })
    }
})