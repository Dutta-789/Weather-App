window.onload = function() {
    window.scrollTo(0, 0);
  };


const synth = window.speechSynthesis;
const location_search=document.querySelector("#location-search");
const suggestions = document.querySelector("#suggestions");
const temperature_title=document.querySelector("#title-current .card-body .card-title h2");
const feelsLike=document.querySelector("#title-current .card-body .current-weather-detail #feel_Like .update");
const wind_speed=document.querySelector("#title-current .card-body .current-weather-detail #wind_speed .update");
const precip=document.querySelector("#title-current .card-body .current-weather-detail #precip .update");
const humidity=document.querySelector("#title-current .card-body .current-weather-detail #humidity .update");
const img_icon=document.querySelector("#title-current .card-body .card-title img");
const current_weather=document.querySelector("#title-current .card-body .card-title h4");
const weatherTextEl = document.querySelector("#weather_info");
const copyBtn=document.querySelector("#copy-btn");
const voiceSelect = document.querySelector("#voiceSelect");
const settingsBtn = document.querySelector("#settings-btn");
const settingsContainer=document.querySelector("#settings-container");


let map = L.map('map').setView([20, 78], 5);
L.tileLayer(`https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=zVdHWEDjLY8ZSN5a4CE3`, {
              attribution: '&copy; MapTiler'
    }).addTo(map);
  
let marker;


location_search.addEventListener("input",getLocation);

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

//printing the forecast time
function time(hour, card){
    let time_card=card.querySelectorAll('.card-body .card-text .time');
    for(let i=0;i<4;i++){
        let time_temp=hour[i].temp_c;
        time_card[i].querySelector(".update").textContent=`${time_temp}°C ${hour[i].condition.text}`;
        time_card[i].querySelector("img").src=`https:${hour[i].condition.icon}`;
    } 
}

//calling the each card of the forecast card
function printForecast(timeArray){
    let cards = document.querySelectorAll('.weather-forecast-card');
    for(let i=0;i<3;i++){
       time((timeArray[i].hour.filter((value, index) => index % 6 === 0)),cards[i]);
    }    
}

//setting the background image
async function setBackgroundImage(keyword) {
    try {
      const response = await fetch(`http://localhost:3000/image?query=${encodeURIComponent(keyword)}`);
      const data = await response.json();
  
      if (data.hits && data.hits.length > 0) {
        const imageUrl = data.hits[0].largeImageURL;
        document.body.style.opacity = 0;
        setTimeout(() => {
          document.body.style.backgroundImage = `url(${imageUrl})`;
          document.body.style.opacity = 1;
        }, 250);
        
      } else {
        console.log("No images found for this keyword.");
      }
    } catch (error) {
      console.error("Error fetching image from Pixabay:", error);
    }
}


//getting location coordinates in the MAP
async function getLocation(){
    const query = location_search.value;
    if (query.length < 3) return;              
    const response = await axios.get(`http://localhost:3000/map?query=${query}`);
    const results = response.data.features;   
    suggestions.innerHTML="";              
    results.forEach(result => 
    {
        let li = document.createElement("li");
        li.textContent = result.place_name;
        li.classList.add("list-group-item");
        li.addEventListener("click", async() =>{
            await getWeather(result);
        });
        suggestions.appendChild(li);
    });
}
//getting location weather
async function getWeather(result){
    
    let place_name=document.getElementById("location-search");
    place_name.value = result.place_name;
    suggestions.innerHTML = "";
            
    let coordinates = result.geometry.coordinates;
   
    coordinates.reverse();
    map.setView([coordinates[0]+0.0025,coordinates[1]],9);


    //setting the location in the map                     
    if (marker) 
        map.removeLayer(marker);
    marker = L.marker(coordinates).addTo(map);

    try{
      const weather=await fetch(`http://localhost:3000/weather?lat=${coordinates[0]}&lon=${coordinates[1]}`);
      const data=await weather.json();
      const temperature_c=data.current.temp_c;
      const icon=`https:${data.current.condition.icon}`;
      const msg=data.current.condition.text;
      let popupContent = `<div class="alert shadow-lg  alert-success" style="width: 14rem;">
                          <div class="card-body" style="text-align : center">
                          <h5 id="place-name" class="card-title">${result.place_name}</h5>
                          <img  id="popup-image" src="${icon}" style=" min-height: 50px; min-width: 50px; max-height:100px; max-width:100px;"  alt="weather png">
                          <p id="text_icon" class="card-text" style="font-size: 17px; !important  padding-bottom: 0px !important" >${msg}</p>
                          <p id="coordinates" class="card-text" style="font-size: 15px">Temperature(°C):${temperature_c}°C </p>
                          <a href="#weather-container" class="btn btn-lg btn-primary btn-sm" style="color: white !important;">See the forecast</a>
                          </div>
                          </div>`;
  
      current_weather.innerText=`${result.place_name}`;
      img_icon.src=`${icon}`;
      feelsLike.innerText=`${data.current.feelslike_c} °C`;
      wind_speed.innerText=`${data.current.wind_kph} Kph`;
      precip.innerText=`${data.current.precip_mm} mm`;
      humidity.innerText=`${data.current.humidity} %`;
      temperature_title.innerText=`${data.current.temp_c}°C`;
  
      let timeArray=data.forecast.forecastday;
      
      let message = `<img src="../assets/icon_images/cloudy (1).png" alt="icon"> Today feels like <strong>${data.current.feelslike_c}°C</strong> with <strong>${data.current.condition.text}</strong> `;
      message += `At ${result.place_name}. The actual temperature is <img src="../assets/icon_images/hot.png"> <strong>${data.current.temp_c}°C</strong>, 
                  with winds blowing from the 
                  <strong>${data.current.wind_dir}</strong> at 
                  <img src="../assets/icon_images/wind.png"> <strong>${data.current.wind_kph} km/h</strong>. `;
      message += `<img src="../assets/icon_images/water-drop.png"> Humidity is around <strong>${data.current.humidity}%</strong>. <br>`;
    
      // Custom suggestion based on condition
      if (data.current.condition.text.includes("rain")) {
        message += "☔ Don’t forget your umbrella!";
      } else if (data.current.condition.text.includes("clear") || data.current.condition.text.includes("sunny")) {
        message += "😎 It’s a good day to be outside!";
      } else if (data.current.condition.text.includes("snow")) {
        message += "❄️ Stay warm, it might be slippery outside!";
      } else if (data.current.humidity> 80) {
        message += "💧 It's quite humid, stay hydrated!";
      } else if (data.current.humidity< 80  || data.current.humidity>=30) {
        message += "😎 It will be a nice day!!";
      } else if (data.current.humidity<30) {
        message += "🌬️ It is a Dry day!!, Be sure to moisture yourself!";
      }
      const information=document.querySelector("#weather_info");
      information.innerHTML=message;
      setBackgroundImage(data.current.condition.text);
      printForecast(timeArray);      
  
      marker.bindPopup(popupContent, { maxWidth: "auto",
          autoPan: true 
      }) // Adjusts the width dynamically
      marker.openPopup();
    }
    catch(error){
      

      document.querySelector("#weather_info").style.display = "none";

    }  
    
}




         



         

    