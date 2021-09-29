var searchInput = document.querySelector("#search")
var submitEl = document.querySelector("#form")
var cityList = document.querySelector("#prev-search-list")
var apiKey = 'ffb7e55f593d9cc120525edbd6e94c9e'
var weatherAppCityList = 'weatherAppCityList';

// render from local storage
function renderCityList(updatedCityArray) {
  cityList.innerHTML = ''
  for (i = 0; i < updatedCityArray.length; i++) {
    var tempItem = updatedCityArray[i];

    var li = document.createElement('li');

    li.innerHTML = `${tempItem.name}, ${tempItem.country}`;
    cityList.appendChild(li);
  }
}

// store VALID city to local storage
function saveCitySearch(name, country) {
  var cityObj = {
    name: name,
    country: country
  }

  var storedCityArray = JSON.parse(localStorage.getItem(weatherAppCityList))

  if (storedCityArray == null) {
   storedCityArray = [];
  } 
// no check for max length or duplicates
  storedCityArray.push(cityObj)
  localStorage.setItem(weatherAppCityList, JSON.stringify(storedCityArray))
  renderCityList(storedCityArray)
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
    console.log(locRes['name'],locRes['name'],locRes['sys']['country']);
    
    saveCitySearch(locRes['name'], locRes['sys']['country']);
  })
  .catch(function (error) {
    console.error(error);
  })
}

// render results
// temp, wind speed, humidity, UV i
function renderStats(params) {
  
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