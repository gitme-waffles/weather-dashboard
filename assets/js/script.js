var searchInput = document.querySelector("#search")
var searchBtn = document.querySelector("#search-button")
var apiKey = 'ffb7e55f593d9cc120525edbd6e94c9e'

// API search
function findCity(searchInputVal) {
  var apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${searchInputVal}&units=metric&appid=${apiKey}`
  
  fetch(apiUrl)
  .then(function (response) {
    return response.json();
  })
  .then(function (locRes) {
    console.log(locRes);
    
  })
}

// render results
// temp, wind speed, humidity, UV i
function renderStats(params) {
  
}

// input handler
function citySearchHandler(){
  if (!searchInput.value)  {
    console.error('You need a search input value!'); 
  } else {
    findCity(searchInput.value)
  }
}

// click event
searchBtn.addEventListener("click", citySearchHandler)