const API_KEY = '45a49cb5d9d6624a599cbac7a29e86f5';
document.addEventListener("DOMContentLoaded", () => {
    let date = new Date();
    const monthYear = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long"
    });
    const fullDate = date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric", 
        month: "short",
        day: "numeric"
    });

    //   setting current date and time 
    const monYear = document.querySelector("main").firstElementChild.firstElementChild.firstElementChild;
    monYear.innerHTML = monthYear;
    monYear.nextElementSibling.innerHTML = fullDate;
})

// using current location...
document.getElementById("currentLoc").addEventListener("click", () => {
    let latitude = "";
    let longitude = "";

    // getting current location details
    navigator.geolocation.getCurrentPosition(async (position) => {
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        const cityUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;
        const city = await fetch(cityUrl).then(res => res.json())
        fetchWeather(city.name)
    }, (error) => {
        console.log(error)
    });


})



const fetchWeather = async (city) => { // fetching weather details...
    city = city === "" ? "delhi" : city;
    try {
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}`;
        document.querySelector("#load").classList.remove("hidden");
        const [weatherResponse, forecastResponse] = await Promise.all([
            fetch(weatherUrl),
            fetch(forecastUrl)
        ]);

        if (!weatherResponse.ok) {
            showError(`Failed to fetch weather data: ${weatherResponse.statusText}`);
            return;
        }

        if (!forecastResponse.ok) {
            showError(`Failed to fetch forecast data: ${forecastResponse.statusText}`);
            return;
        }

        const weatherData = await weatherResponse.json();
        const forecastData = await forecastResponse.json();
        document.querySelector("#load").classList.add("hidden");
        // console.log({ weatherData, forecastData })
        ShowDetails({ weatherData, forecastData });
    } catch (error) {
        showError(error.message || "An unexpected error occurred");
    }
};

fetchWeather(""); // for default... value at starting..

// handling error using error dialogue box..
function showError(error) {
    console.error("Error: " + error);
    let errorbox = document.getElementById("error");
    errorbox.firstElementChild.lastElementChild.innerHTML = error;
    errorbox.classList.remove("hidden");
    let countDown = setInterval(() => {
    }, 1000)
    setTimeout(() => {
        errorbox.classList.add("hidden");
        countDown.clearInterval();

    }, 4000)
}

// error dialogue box closing function
document.querySelector("#error span").addEventListener("click", (e) => {
    let errorbox = document.getElementById("error");
    errorbox.classList.add("hidden");
})

// showing details.... 
function ShowDetails({ weatherData, forecastData }) {
    document.getElementById("search").value = "";
    const iconCode = weatherData.weather[0].icon;
    console.log(iconCode)
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;

    const city = document.getElementById("city");
    city.innerHTML = `${weatherData.name}`;
    console.log(weatherData.weather)
    const weather =  city.parentElement.nextElementSibling;

    weather.lastElementChild.innerHTML = weatherData.weather[0].main;

    weather.nextElementSibling.firstElementChild.src = iconUrl

    // temperature...
    const temp = Math.round((weatherData.main.temp) - 275.15);
    city.parentElement.nextElementSibling.firstElementChild.innerHTML = `${temp} &degC`

    // sunset and sunrise..

    const sunriseTime = new Date((weatherData.sys.sunrise + weatherData.timezone) * 1000)
        .toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

    const sunsetTime = new Date((weatherData.sys.sunset + weatherData.timezone) * 1000)
        .toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

    const sunrise = document.getElementById("sunrise");
    sunrise.innerHTML = `Sunrise: ${sunriseTime}`;
    sunrise.nextElementSibling.innerHTML = `Sunset: ${sunsetTime}`;


    let forecast = document.getElementById("add_row");
    forecast.innerHTML = " ";
    let count = 0;

    const filteredDailyForecasts = forecastData.list.filter(entry => {
        return entry.dt_txt.includes("12:00:00"); // or "15:00:00" if you prefer afternoon
    });
    (filteredDailyForecasts).map((value) => {
        count += 1;
        if (count <= 5)
            forecast.innerHTML += `<tr>
                    <td>${value.dt_txt.split(" ")[0]}</td>
                    <td>${Math.round((value.main.temp-275.15))} &deg;C</td>
                    <td>${value.weather[0].main}</td>
                    <td>${value.main.humidity}%</td>
                    <td>${value.clouds.all}%</td>
                </tr>`;
    })

    const wind = document.getElementById("today");
    wind.lastElementChild.innerHTML = weatherData.wind.speed + " m/s";

    let humi = wind.nextElementSibling;
    humi.lastElementChild.innerHTML = weatherData.main.humidity + "%";

    let pressure = humi.nextElementSibling;
    pressure.lastElementChild.innerHTML = weatherData.main.pressure + " hPa";

    pressure.nextElementSibling.lastElementChild.innerHTML = weatherData.visibility / 1000 + " Km";
}

search.addEventListener("keypress", (e) => {
    let city = e.target.value;  // getting city..
    city = city.trim();
    if (e.which === 13 && city !== "") {
        fetchWeather(city);
    }
})



//---------------------------------------------------


// Function to update recent searches
function updateRecents(city) {
    if (!city) return;

    let recents = JSON.parse(localStorage.getItem("recents")) || [];
    if (!recents.includes(city)) {
        recents.unshift(city); 
        if (recents.length > 3) recents.pop(); // Keep only the last 3 cities
        localStorage.setItem("recents", JSON.stringify(recents));
    }
    renderRecents();
}

// Function to render recent searches
function renderRecents() {
    const recentsContainer = document.getElementById("recents");
    let recents = JSON.parse(localStorage.getItem("recents")) || [];
    recentsContainer.innerHTML = recents
        .map(city => `<li class="recent-item cursor-pointer hover:text-blue-500">${city}</li>`)
        .join("");
}

// Event listener for clicking on recent cities
document.getElementById("recents").addEventListener("click", (e) => {
    if (e.target.classList.contains("recent-item")) {
        const city = e.target.textContent;
        fetchWeather(city);
    }
});

// Event listener for clearing recent searches
document.getElementById("clear-recents").addEventListener("click", () => {
    localStorage.removeItem("recents");
    renderRecents();
});

// Call updateRecents when fetching weather
search.addEventListener("keypress", (e) => {
    let city = e.target.value.trim(); 
    if (e.which === 13 && city !== "") {
        updateRecents(city); // Add to recents
        fetchWeather(city);
    }
});


document.addEventListener("DOMContentLoaded", renderRecents);