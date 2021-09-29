var searchInput = document.querySelector("#search")
var submitEl = document.querySelector("#form")
var cityList = document.querySelector("#prev-search-list")

// current weather elements
var tempEl = document.querySelector("#temp-current")
var windEl = document.querySelector("#wind-current")
var humidityEl = document.querySelector("#hum-current")
var uvEl = document.querySelector("#uvi-box")

var apiKey = 'ffb7e55f593d9cc120525edbd6e94c9e'
var weatherAppCityList = 'weatherAppCityList';

// render from local storage
function renderCityList(updatedCityArray) {
  cityList.innerHTML = ''
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
  // if (!duplicateChecker) {
  // }
  storedCityArray.push(cityObj)
  localStorage.setItem(weatherAppCityList, JSON.stringify(storedCityArray))
  renderCityList(storedCityArray)
  // no check for max length or duplicates
}

// API search
function findCity(searchInputVal) {
  var apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${searchInputVal}&units=metric&appid=${apiKey}`
  
  fetch(apiUrl)
  .then(function (response) {
    return response.json();
  })
  .then(function (locRes) {
    console.log(locRes);
    
    saveCitySearch(
      locRes['name'],
      locRes['sys']['country'],
      locRes['coord']
    );
    weatherCall();
  })
  .catch(function (error) {
    console.error(error);
    renderCurrentStats
  })    
    
}

// render results
// temp, wind speed, humidity, UV i
// current[humidity], current[temp]
// wind[speed]
function renderCurrentStats(weatherData) {
  tempEl.innerHTML = weatherData.temp;
  windEl.innerHTML = weatherData.wind_speed;
  humidityEl.innerHTML = weatherData.humidity;
  // 1-2, 3-5, 8-10
  var uvi = weatherData.uvi
  uvEl.innerHTML = uvi;
  uvEl.removeAttribute('class')
    if (uvi < 3) {
      uvEl.classList.add('uvi-box-green')
    } else if (uvi < 6) {
      uvEl.classList.add('uvi-box-yellow')
    } else if (uvi < 11) {
      uvEl.classList.add('uvi-box-red')
    }

}
function renderForercast() {

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
    renderForercast()
  })
  .catch(function (error) {
    console.error(error);
  })
  
  //  get coords from local storage
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
// searchBtn.addEventListener("enter", citySearchHandler) 
renderCityList(getLocalStorage())