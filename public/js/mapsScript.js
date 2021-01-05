// Script to deal with the Map UI
// Read data rendered by the server and updates the map accordingly.

var map, infoWindow, page;
var cities = [
  { city_name: "Adelaide", lat: -34.928, lon: 138.6 },
  { city_name: "Brisbane", lat: -27.469, lon: 153.025 },
  { city_name: "Canberra", lat: -35.28, lon: 149.13 },
  { city_name: "Gold Coast", lat: -28.0167, lon: 153.4 },
  { city_name: "Melbourne", lat: -37.813, lon: 144.963 },
  { city_name: "Newcastle", lat: -32.928, lon: 151.781 },
  { city_name: "Perth", lat: -31.95, lon: 115.86 },
  { city_name: "Sydney", lat: -33.868, lon: 151.209 },
];

function nearMe() {
  let btn = document.querySelector("#near-me");
  btn.addEventListener("click", (event) => {
    event.preventDefault();
    initMap();
  });
}

function createMarker(lat, lng, map, title) {
  return new google.maps.Marker({
    position: { lat: lat, lng: lng },
    map: map,
    title: title,
    animation: google.maps.Animation.DROP,
  });
}

function createInfoWindow(content) {
  return new google.maps.InfoWindow({
    content: content,
    maxWidht: 200,
  });
}

function addMarkersToMap(map) {
  let cards = document.querySelectorAll(".restaurant-card");

  cards.forEach((card) => {
    let title = card.querySelector("div.restaurant-name").innerText;
    let lat = card.querySelector(
      "div div div.restaurant-coordinates .restaurant-lat"
    ).innerText;
    let lon = card.querySelector(
      "div div div.restaurant-coordinates .restaurant-lon"
    ).innerText;

    let infoWindow = createInfoWindow(`<p><b>${title}</b></p>`);
    let marker = createMarker(Number(lat), Number(lon), map, title);
    marker.addListener("click", function () {
      infoWindow.open(map, marker);
    });
  });
}

function getCoordinates(map) {
  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        let pos = {};
        let city_name = document.querySelector("#city-name").innerText;

        if (city_name === "Brisbane") {
          pos.lat = position.coords.latitude;
          pos.lng = position.coords.longitude;
          marker = createMarker(pos.lat, pos.lng, map, "Your location");
          let infoWindow = createInfoWindow(`<p>Your Location</p>`);
          marker.addListener("click", function () {
            infoWindow.open(map, marker);
          });
        }

        // Get local restaurant from zomato
        // Add markers to the map
        // add infoWindows to the markers

        // console.log(window.location.href);
        page = window.location.href;

        if (page.search("restaurants?") >= 0) {
          console.log("X");
          addMarkersToMap(map);
          console.log("adding markers...");
        }

        // if (page.search("view") >= 0) {
        //   console.log("adding restaurant details...");
        //   res_lat = parseFloat(document.querySelector("#res-lat").innerText);
        //   res_lon = parseFloat(document.querySelector("#res-lon").innerText);
        //   res_name = document.querySelector("#res-name").innerText;
        //   marker = createMarker(res_lat, res_lon, map, res_name);
        //   let infoWindow = createInfoWindow(res_name);
        // //   marker.addListener("click", function () {
        //     infoWindow.open(map, marker);
        // //   });
        // }

        // Center map as per current city
        cities.forEach((city) => {
          // console.log(encodeURI(city.city_name))
          if (page.search(encodeURI(city.city_name)) >= 0) {
            console.log("current city: " + city.city_name);
            pos.lat = parseFloat(city.lat);
            pos.lng = parseFloat(city.lon);
          }
        });

        map.setCenter(pos);
      },
      function () {
        handleLocationError(true, infoWindow, map.getCenter());
      }
    );
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }
}

function createMap(zoom) {
  // Initialize map
  map = new google.maps.Map(document.getElementById("map"), {
    center: {
      lat: -27.469,
      lng: 153.025,
    },
    zoom: zoom,
  });
  return map;
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(
    browserHasGeolocation
      ? "Error: The Geolocation service failed."
      : "Error: Your browser doesn't support geolocation."
  );
  infoWindow.open(map);
}

function initMap() {
  // Create a map with a zoom of 13
  map = createMap(13);
  // Get location and/or restaurant coords markers
  getCoordinates(map);
}
