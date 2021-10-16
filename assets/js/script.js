var searchInput = document.querySelector("#search")
var submitEl = document.querySelector("#form")
var cityList = document.querySelector("#prev-search-list")

// current heading El
var currentDityEl = document.querySelector("#current-city")
var currentDateEl = document.querySelector("#current-date")
var currentIconEl = document.querySelector("#current-icon")

// current forecast elements
var currentTempEl = document.querySelector("#temp-current")
var currentWindEl = document.querySelector("#wind-current")
var currentHumidityEl = document.querySelector("#hum-current")
var uvEl = document.querySelector("#uvi-box")

// week forecast elements
var weekForecast = document.querySelector("#week-forecast")

var apiKey = 'ffb7e55f593d9cc120525edbd6e94c9e'
var weatherAppCityList = 'weatherAppCityList'

var currentCity = document.querySelector("#current-city")
var currentCountry = document.querySelector("#current-country")
var currentDate = document.querySelector("#current-date")
var currentIcon = document.querySelector("#current-icon")

// render from list of saved cities (local storage)
function recycleList(event) {
  findCity(event.target.innerHTML)  
}

function renderCityList(updatedCityArray) {
  cityList.innerHTML = ''
  // most recent is start (top) of list
  for (i = updatedCityArray.length - 1; i >= 0; i--) {
    var tempItem = updatedCityArray[i];
    var li = document.createElement('li');

    li.innerHTML = `${tempItem.name}, ${tempItem.country}`;
    li.addEventListener("click", recycleList);
    cityList.appendChild(li);
  }
}

function getLocalStorage() {
  var storedCityArray = JSON.parse(localStorage.getItem(weatherAppCityList))

  if (storedCityArray == null) {
   storedCityArray = [];
  }
  return storedCityArray;
}

// store VALID city to local storage
function saveCitySearch(name, country, coord) {    
  var cityObj = {
    name: name,
    country: country,
    lat: coord.lat,
    lon: coord.lon
  }

  var storedCityArray = getLocalStorage();
  // check for duplicate cities before setting to local storage
  var targetIndex = -1;
  for (i = 0; i < storedCityArray.length; i++) {
    if (storedCityArray[i].lat === cityObj.lat && storedCityArray[i].lon === cityObj.lon) {
      targetIndex = i; 
      break     
    }
  }
  if (targetIndex >= 0) { 
  storedCityArray.splice(targetIndex, 1);
  }
  // length check
  storedCityArray.push(cityObj)
  const maxArrayLength = 8;
  if (storedCityArray.length > maxArrayLength) {
  storedCityArray.splice(0, storedCityArray.length - maxArrayLength)
  }
  localStorage.setItem(weatherAppCityList, JSON.stringify(storedCityArray))
  renderCityList(storedCityArray) 
}

// var tempEl = document.createElement('p')
// tempEl.innerHTML = `Temperature: ${forecastData[i].temp.day}&#176;C`
// cardEl.appendChild(tempEl)

function errorModal(error){
  // create El
  $('#modalField').html('')
  console.log(error)
  var errorEl =  $("<p>")
  
  // set innerHTML with a value =>> error
  if (error == 404) {
    errorEl.html(`Error ${error} <br /> Could not find location`)

  } else {
    errorEl.html(`Error ${error}`)
  }
  
  $('#modalField').append(errorEl)

  // run modal remove $(".hide")
  $('#modal').removeClass("hide")
  $('#modal').modal({
    fadeDuration: 100
  });
}

// API search for city coords by input 
function findCity(searchInputVal) {
  var apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${searchInputVal}&units=metric&appid=${apiKey}`
  
  fetch(apiUrl)
  .then(function (response) {
    console.log(response)
    if (response.status != 200) {
      errorModal(response.status)
    }
    return response.json();
  })
  .then(function (locRes) {  
    console.log(locRes.cod)
    // if (locRes.cod != 200) {}
      // errorModal(locRes)
    
    saveCitySearch(
      locRes['name'],
      locRes['sys']['country'],
      locRes['coord']
    ),
      renderCurrentHeading(
        locRes['name'],
        locRes['sys']['country'],
        locRes['dt'],
        locRes['weather'][0]['icon']
      ),
    weatherCall()
  })
  .catch(function (error) {
    console.error(error);
    // if (error == "reading 'country")
    // errorModal(error);
       
  })        
}

// render results
function renderCurrentHeading(name, country, unix, icon) {
  currentCity.innerHTML = `${name},`;
  currentCountry.innerHTML = country;
  currentDate.innerHTML = moment.unix(unix).format("DD/MMM/YYYY");
  currentIconEl.setAttribute("src", `http://openweathermap.org/img/wn/${icon}@2x.png`);
}

function renderCurrentStats(weatherData) {
  currentTempEl.innerHTML = weatherData.temp;
  currentWindEl.innerHTML = weatherData.wind_speed;
  currentHumidityEl.innerHTML = weatherData.humidity;
  // UV index colour changes
  var uvi = weatherData.uvi
  uvEl.innerHTML = uvi;
  uvEl.removeAttribute('class')
  if (uvi < 3) {
      uvEl.classList.add('uvi-box-green')
  } else if (uvi < 6) {
    uvEl.classList.add('uvi-box-yellow')
  } else if (uvi < 8) {
    uvEl.classList.add('uvi-box-orange')
  } else if (uvi < 11) {
    uvEl.classList.add('uvi-box-red')
  } else if (uvi > 10) {
    uvEl.classList.add('uvi-box-violet')
  }
}

function renderForercast(forecastData) {
  weekForecast.innerHTML = ''
  for (i = 1; i < 6; i++) {
  var cardEl = document.createElement('div')
  cardEl.className += 'forecast-card'
    
  var dateEl = document.createElement('p')
  dateEl.innerHTML = moment.unix(forecastData[i].dt).format("DD/MMM/YYYY")
  cardEl.appendChild(dateEl)

  var iconEl = document.createElement('img')
  var icon = forecastData[i].weather[0].icon
  iconEl.setAttribute("src", `http://openweathermap.org/img/wn/${icon}.png`); 
  cardEl.appendChild(iconEl)

  var tempEl = document.createElement('p')
  tempEl.innerHTML = `Temperature: ${forecastData[i].temp.day}&#176;C`
  cardEl.appendChild(tempEl)

  var windEl = document.createElement('p')
  windEl.innerHTML = `Wind speed: ${forecastData[i].wind_speed}m/s`
  cardEl.appendChild(windEl)

  var humidityEl = document.createElement('p')
  humidityEl.innerHTML = `Humidity: ${forecastData[i].humidity}%`
  cardEl.appendChild(humidityEl)

  // add new card to the weekForecast container
  weekForecast.appendChild(cardEl)
 }  
}

function weatherCall() {
  var storedCityArray = getLocalStorage();
  var lastCityDeets;
  if (storedCityArray.length > 0) {
    lastCityDeets = storedCityArray[storedCityArray.length - 1]
  } else {
    console.error("couldn't fetch last valid city")
    return;
  }
  
  var apiUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lastCityDeets.lat}&lon=${lastCityDeets.lon}&exclude=hourly,minutely,alerts&units=metric&appid=${apiKey}`
  fetch(apiUrl)
  .then(function (response) {
    return response.json();
  })
  .then(function (locRes) {
    renderCurrentStats(locRes.current);
    console.log(locRes)
    renderForercast(locRes.daily)
  })
  .catch(function (error) {
    console.error(error);
  })  
}

// input handler
function citySearchHandler(event) {
  event.preventDefault();
  if (!searchInput.value)  {
    errorModal('Search is empty!'); 
  } else {
    findCity(searchInput.value)
  }
}

// click event
submitEl.addEventListener("submit", citySearchHandler)
// show list of searched cities when run 
renderCityList(getLocalStorage())