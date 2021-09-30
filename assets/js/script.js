var searchInput = document.querySelector("#search")
var submitEl = document.querySelector("#form")
var cityList = document.querySelector("#prev-search-list")

// current heading El
var currentDityEl = document.querySelector("#current-city")
var currentDateEl = document.querySelector("#current-date")
var currentIconEl = document.querySelector("#current-icon")

// current forecast elements
var tempEl = document.querySelector("#temp-current")
var windEl = document.querySelector("#wind-current")
var humidityEl = document.querySelector("#hum-current")
var uvEl = document.querySelector("#uvi-box")

var apiKey = 'ffb7e55f593d9cc120525edbd6e94c9e'
var weatherAppCityList = 'weatherAppCityList';

var currentCity = document.querySelector("#current-city");
var currentCountry = document.querySelector("#current-country")
var currentDate = document.querySelector("#current-date");
var currentIcon = document.querySelector("#current-icon");

// render from local storage
function renderCityList(updatedCityArray) {
  cityList.innerHTML = ''
  // most recent is start (top) of list
  for (i = updatedCityArray.length - 1; i >= 0; i--) {
    var tempItem = updatedCityArray[i];

    var li = document.createElement('li');

    li.innerHTML = `${tempItem.name}, ${tempItem.country}`;
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
  // var duplicateChecker = storedCityArray.some(function (cityObj2) {return cityObj2.lat === cityObj.lat && cityObj2.lon === cityObj.lon})
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
  // 
  storedCityArray.push(cityObj)
  localStorage.setItem(weatherAppCityList, JSON.stringify(storedCityArray))
  renderCityList(storedCityArray)
  // no check for max length 
}



// API search
function findCity(searchInputVal) {
  var apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${searchInputVal}&units=metric&appid=${apiKey}`
  
  fetch(apiUrl)
  .then(function (response) {
    return response.json();
  })
  .then(function (locRes) {
    console.log(locRes['weather'][0]['icon']);
    
    saveCitySearch(
      locRes['name'],
      locRes['sys']['country'],
      locRes['coord']
    );
      renderCurrentHeading(
        locRes['name'],
        locRes['sys']['country'],
        locRes['dt'],
        locRes['weather'][0]['icon']
      );
    weatherCall();
  })
  .catch(function (error) {
    console.error(error);
       
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
  tempEl.innerHTML = weatherData.temp;
  windEl.innerHTML = weatherData.wind_speed;
  humidityEl.innerHTML = weatherData.humidity;
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
    renderForercast(locRes)
  })
  .catch(function (error) {
    console.error(error);
  })
  
}


// input handler
function citySearchHandler(event) {
  event.preventDefault();
  if (!searchInput.value)  {
    console.error('You need a search input value!'); 
  } else {
    findCity(searchInput.value)
  }
}

// click event
submitEl.addEventListener("submit", citySearchHandler) 
renderCityList(getLocalStorage())