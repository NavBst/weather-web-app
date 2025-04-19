document.addEventListener("DOMContentLoaded",()=>{
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

const fetchWeather = async (city) => { // fetching weather details...
    city = city === "" ? "delhi" : city;
    try {
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=45a49cb5d9d6624a599cbac7a29e86f5`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=45a49cb5d9d6624a599cbac7a29e86f5`;

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
        console.log({ weatherData, forecastData })
        ShowDetails({ weatherData, forecastData });
    } catch (error) {
        showError(error.message || "An unexpected error occurred");
    }
};

fetchWeather("");

function showError(error) {
    console.error("Error: " + error);
}


// showing details.... 
async function ShowDetails({ weatherData, forecastData }) {
    let country = await fetch(`https://restcountries.com/v3.1/alpha/${weatherData.sys.country || "delhi"}`).then(res => res.json()).then((res => res));
    console.log(country)
    const city = document.getElementById("city");
    city.innerHTML = `${weatherData.name}`;
    city.nextElementSibling.innerHTML = `${country[0].name.common}`;

    // temperature...
    const temp = Math.round((weatherData.main.temp) - 275.15);
    city.parentElement.nextElementSibling.firstElementChild.innerHTML = `${temp} &degC`

    // sunset and sunrise

    const sunriseTime = new Date((weatherData.sys.sunrise + weatherData.timezone) * 1000)
        .toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

    const sunsetTime = new Date((weatherData.sys.sunset +  weatherData.timezone) * 1000)
        .toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

    console.log(`Sunrise: ${sunriseTime}`);
    console.log(`Sunset: ${sunsetTime}`);

    const sunrise = document.getElementById("sunrise");
    sunrise.innerHTML = `Sunrise: ${sunriseTime}`;
    sunrise.nextElementSibling.innerHTML = `Sunset: ${sunsetTime}`;


    let forecast = document.getElementById("add_row");
    forecast.innerHTML = " ";
    let count = 0;
    console.log(forecastData);

    const filteredDailyForecasts = forecastData.list.filter(entry => {
        return entry.dt_txt.includes("12:00:00"); // or "15:00:00" if you prefer afternoon
    });
    (filteredDailyForecasts).map((value) => {
        count += 1;
        if (count <= 5)
            forecast.innerHTML += `<tr>
                    <td>${value.dt_txt.split(" ")[0]}</td>
                    <td>${value.main.temp}</td>
                    <td>${value.weather[0].main}</td>
                    <td>${value.main.humidity}</td>
                    <td>${value.clouds.all}</td>
                </tr>`;
    })
}

search.addEventListener("keypress", (e) => {
    let city = e.target.value;  // getting city..
    city = city.trim();
    if (e.which === 13 && city !== "") {
        fetchWeather(city);
    }
})
