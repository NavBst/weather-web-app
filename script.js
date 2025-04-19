const fetchWeather = async (city) => {
    city = city=== "" ? "delhi" : city;
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
        console.log({weatherData, forecastData})
        ShowDetails({weatherData, forecastData});
    } catch (error) {
        showError(error.message || "An unexpected error occurred");
    }
};

fetchWeather("");

function showError(error) {
    console.error("Error: " + error);
}


// showing details.... 
async function ShowDetails({weatherData, forecastData}){
    let country = await fetch(`https://restcountries.com/v3.1/alpha/${weatherData.sys.country || "delhi"}`).then(res=>res.json()).then((res=>res));
    console.log(country)
    const city = document.getElementById("city");
    city.innerHTML = `${weatherData.name}`;
    city.nextElementSibling.innerHTML = `${country[0].name.common}`;

    // temperature...
    const temp = Math.round((weatherData.main.temp)-275.15);
    city.parentElement.nextElementSibling.firstElementChild.innerHTML = `${temp} &degC`
}

search.addEventListener("keypress", (e)=>{
    let city = e.target.value;  // getting city..
    city = city.trim();
    if(e.which === 13 && city !== ""){
        fetchWeather(city);
    }
    
})
