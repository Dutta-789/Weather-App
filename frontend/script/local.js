window.onload = function() {
  document.body.classList.add('fade-in');
  window.scrollTo(0, 0);
};

const synth = window.speechSynthesis;
const locationDiv = document.querySelector("#location");
const getWeatherBtn=document.querySelector("#getWeatherUpdate");
const weatherTextEl = document.querySelector("#weather_info");
const copyBtn=document.querySelector("#copy-btn");
const voiceSelect = document.querySelector("#voiceSelect");
const settingsBtn = document.querySelector("#settings-btn");
const settingsContainer=document.querySelector("#settings-container");
getWeatherBtn.addEventListener("click",getLocation);

let voices = [];

// Populate voice dropdown
function populateVoices() {
  voices = synth.getVoices();
  voiceSelect.innerHTML = '';
  voices.forEach((voice, i) => {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = `${voice.name} (${voice.lang})`;
    if (voice.default) option.textContent += ' — DEFAULT';
    voiceSelect.appendChild(option);
  });
}
 // Initial voice load
populateVoices();
if (typeof synth.onvoiceschanged !== 'undefined') {
  synth.onvoiceschanged = populateVoices;
} 

document.getElementById("mic-btn").addEventListener("click", () => {
  const selectedIndex = voiceSelect.value;
  const selectedVoice = voices[selectedIndex];
  const text = weatherTextEl.innerText;

  const utterance = new SpeechSynthesisUtterance(text);
  if (selectedVoice) utterance.voice = selectedVoice;

  synth.cancel(); // 🛑 Cancel any ongoing speech
  synth.speak(utterance); // ▶️ Start new speech
});


copyBtn.addEventListener("click", () => {
  const text = weatherTextEl.innerText;
  navigator.clipboard.writeText(text).then(() => {
    copyBtn.innerHTML = '<i class="fas fa-check"></i>';
    setTimeout(() => {
      copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
    }, 1500);
  });
});

// Toggle settings dropdown
settingsBtn.addEventListener('click', () => {
  settingsContainer.classList.toggle('show');
});


async function setBackgroundImage(keyword,msg) {
  try {
    const response = await fetch(`https://weather-app-cf6d.onrender.com/image?query=${encodeURIComponent(keyword)}`);
    const data = await response.json();

    if (data.hits && data.hits.length > 0) {
      const imageUrl = data.hits[0].largeImageURL;     
      document.body.classList.remove('fade-in');
      
      setTimeout(() => {
        document.body.classList.add('fade-in');
        document.body.style.backgroundImage = `url(${imageUrl})`;
        locationDiv.classList.replace('alert-info', 'alert-success');
        locationDiv.innerHTML=msg;
        update();
        
      }, 500);
      
    } else {
      console.log("No images found for this keyword.");
    }
  } catch (error) {
    console.error("Error fetching image from Pixabay:", error);
  }
}
function location_name(location){
    const loca_name=document.querySelector("#title-current .card-body .card-title h4");
    loca_name.innerText=`${location.name},${location.region},${location.country}`;
}
function time(hour, card){
  let time_card=card.querySelectorAll('.card-body .card-text .time');
  for(let i=0;i<4;i++){
      let time_temp=hour[i].temp_c;
      time_card[i].querySelector(".update").textContent=`${time_temp}°C ${hour[i].condition.text}`;
      time_card[i].querySelector("img").src=`https:${hour[i].condition.icon}`;
  }  
}
function forecastWeather(forecast){
    let cards = document.querySelectorAll('.weather-forecast-card');
    for(let i=0;i<3;i++){
      time((forecast[i].hour.filter((value, index) => index % 6 === 0)),cards[i]);
    }
}

function currentWeather(current){
    const feelsLike=document.querySelector("#feel_Like .update");
    const wind_speed=document.querySelector("#wind_speed .update");
    const precip=document.querySelector("#precip .update");
    const humidity=document.querySelector("#humidity .update");
    const temp_c=document.querySelector("#title-current .card-body .card-title h2");
    const weather_icon=document.querySelector("#title-current .card-body .card-title img");
    feelsLike.innerText=`${current.feelslike_c} °C`;
    wind_speed.innerText=`${current.wind_kph} Kph`;
    precip.innerText=`${current.precip_mm} mm`;
    humidity.innerText=`${current.humidity} %`;
    temp_c.innerText=`${current.temp_c}°C`;
    weather_icon.src=`https:${current.condition.icon}`;

    let message = `<img src="../assets/icon_images/cloudy (1).png" alt="icon"> Today feels like <strong>${current.feelslike_c}°C</strong> with <strong>${current.condition.text}</strong>. `;
    message += `The actual temperature is <img src="../assets/icon_images/hot.png"> <strong>${current.temp_c}°C</strong>, 
                with winds blowing from the 
                <strong>${current.wind_dir}</strong> at 
                <img src="../assets/icon_images/wind.png"> <strong>${current.wind_kph} km/h</strong>. `;
    message += `<img src="../assets/icon_images/water-drop.png"> Humidity is around <strong>${current.humidity}%</strong>. <br>`;
  
    // Custom suggestion based on condition
    if (current.condition.text.includes("rain")) {
      message += "☔ Don’t forget your umbrella!";
    } else if (current.condition.text.includes("clear") || current.condition.text.includes("sunny")) {
      message += "😎 It’s a good day to be outside!";
    } else if (current.condition.text.includes("snow")) {
      message += "❄️ Stay warm, it might be slippery outside!";
    } 
    if (current.humidity>= 80) {
      message += "💧 It's quite humid, stay hydrated!";
    } else if (current.humidity< 80  && current.humidity>=60) {
      message += " 😓 Feels sticky or muggy !!";
    }else if(current.humidity< 60  && current.humidity>=30){
      message += "🤏 Slightly humid, still okay";  
    } else if (current.humidity<30) {
      message += "🌬️ It is a Dry day!!, Be sure to moisture yourself!";
    }

    if (current.feelslike_c<=0) {
      message += "❄️ Damn its too cold";
    } else if (current.feelslike_c>0 && current.feelslike_c<=10) {
      message += "🧥 Chilly, need a jacket!";
    } else if (current.feelslike_c>10 && current.feelslike_c<=20) {
      message += "🌬️ Light jacket weather, fresh air!";
    } else if (current.feelslike_c>20 && current.feelslike_c<=25) {
      message += "😊 Comfortable, ideal weather, touch some grass!";
    }else if (current.feelslike_c>25 && current.feelslike_c<=30) {
      message += "🌤️	Slightly hot, good for outings!";
    }else if (current.feelslike_c>30 && current.feelslike_c<=35) {
      message += "🔥 Feels hot, may sweat!";
    }else if (current.feelslike_c>35 && current.feelslike_c<=40) {
      message += "🥵 Risk of heat stress, uncomfortable!";
    } else if (current.feelslike_c>40) {
      message += "🌋 Dangerous, heatwave, stay indoors Bro!";
    }

  const information=document.querySelector("#weather_info");
  information.innerHTML=message;
}

function update(){
    document.querySelector("#info_about_weather").classList.remove('d-none');
    document.querySelector(".detail").classList.remove('d-none');
    document.querySelector("#weather-forecast").classList.remove('d-none');
}

function getLocation() {
  if(locationDiv.classList.contains('alert-success') || locationDiv.classList.contains('alert-danger')){
    locationDiv.classList.replace('alert-success', 'alert-info');
    locationDiv.classList.replace('alert-danger', 'alert-info');
  }
    
    if (navigator.geolocation) {
      locationDiv.innerHTML = `<div>
                                      <div class="spinner-border text-success" role="status">
                                            <span class="visually-hidden">Loading...</span>
                                      </div>
                              </div>
                                Getting location...`;
      navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
      locationDiv.classList.replace('alert-info', 'alert-danger');
      locationDiv.innerHTML = "Geolocation is not supported by this browser.";
    }
  }

  async function showPosition(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    if(locationDiv.classList.contains('alert-success') || locationDiv.classList.contains('alert-danger')){
      locationDiv.classList.replace('alert-success', 'alert-info');
      locationDiv.classList.replace('alert-danger', 'alert-info');
    }
    
     let msg = `
      <strong>Latitude:</strong> ${lat} <br>
      <strong>Longitude:</strong> ${lon}
    `;
    try{
      const weather=await fetch(`https://weather-app-cf6d.onrender.com/weather?lat=${lat}&lon=${lon}`);
      const data=await weather.json();
      
     
      setTimeout(() => {
        currentWeather(data.current);
        location_name(data.location);
        forecastWeather(data.forecast.forecastday);
        
      },250);
      setBackgroundImage(data.current.condition.text,msg);
      
    }
    catch(error){
      locationDiv.classList.replace('alert-success', 'alert-danger');
      locationDiv.innerHTML = "Try Again Later";
      document.querySelector("#weather_info").style.display = "none";
    }    
  }

  function showError(error) {
    if(locationDiv.classList.contains('alert-success') || locationDiv.classList.contains('alert-danger')){
      locationDiv.classList.replace('alert-success', 'alert-info');
      locationDiv.classList.replace('alert-danger', 'alert-info');
    }
    locationDiv.classList.replace('alert-info', 'alert-danger');
    switch(error.code) {
      case error.PERMISSION_DENIED:
        locationDiv.innerHTML = "❌ User denied the request for Geolocation.";
        break;
      case error.POSITION_UNAVAILABLE:
        locationDiv.innerHTML = "❌ Location information is unavailable.";
        break;
      case error.TIMEOUT:
        locationDiv.innerHTML = "❌ The request to get user location timed out.";
        break;
      case error.UNKNOWN_ERROR:
        locationDiv.innerHTML = "❌ An unknown error occurred.";
        break;
    }
  }