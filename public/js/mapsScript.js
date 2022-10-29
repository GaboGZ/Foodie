// Script to deal with the Map UI
// Read data rendered by the server and updates the map accordingly.

class Map {

  constructor() {
    this.map = null;
    this.markers = [];
    this.infoWindow = null;
    this.page = null;
    this.cities = [
      { city_name: "Adelaide", lat: -34.928, lon: 138.6 },
      { city_name: "Brisbane", lat: -27.469, lon: 153.025 },
      { city_name: "Canberra", lat: -35.28, lon: 149.13 },
      { city_name: "Gold Coast", lat: -28.0167, lon: 153.4 },
      { city_name: "Melbourne", lat: -37.813, lon: 144.963 },
      { city_name: "Newcastle", lat: -32.928, lon: 151.781 },
      { city_name: "Perth", lat: -31.95, lon: 115.86 },
      { city_name: "Sydney", lat: -33.868, lon: 151.209 },
    ];
    this.init();
  }
  
  init() {
    console.log("initMap");
    this.infoWindow = new google.maps.InfoWindow( { content: '' });
    this.map = new google.maps.Map(document.querySelector('#map'), {
      center: { lat: -27.469, lng: 153.025, },
      zoom: 11
    });

    // Get location and/or restaurant coords markers
    this.getLocation();
  }

  nearMe() {
    let btn = document.querySelector("#near-me");
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      initMap();
    });
  }
  
  createMarker(position, title) {
    return new google.maps.Marker({
      position: { 
        lat: position.lat, 
        lng: position.lng
      },
      map: this.map,
      title: title,
      animation: google.maps.Animation.DROP,
    });
  }
  
  createInfoWindow(content) {
    return new google.maps.InfoWindow({
      content: content,
      maxWidht: 200,
    });
  }
  
  addMarkersToMap(map) {
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

  addRestaurantMarkers(){
    // Get local restaurant from zomato
    // Add markers to the map
    // add infoWindows to the markers

    // console.log(window.location.href);
    this.page = window.location.href;
    if (this.page.search("restaurants?") >= 0) {
      this.addMarkersToMap(map);
    }
  }

  getLocation() {
    // Try HTML5 geolocation.
    if ( !navigator.geolocation ) {
      // Browser doesn't support Geolocation
      this.handleLocationError();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        let marker = this.createMarker( {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }, "Your location");
        this.markers.push(marker);
        marker.addListener('click', () => {
          this.infoWindow.setContent("You are here");
          this.infoWindow.open( {
            anchor: marker,
            map: this.map,
            shouldFocus: true
          })
        });
  
        this.map.setCenter(pos);
      },
      (error) => {
        console.error({ error });
        this.handleLocationError(true);
      }
    );

  }
  
  handleLocationError(browserHasGeolocation = false) {
    this.infoWindow.setPosition(this.map.getCenter());
    this.infoWindow.setContent( 
      browserHasGeolocation ? 
        "Error: The Geolocation service failed."
        : "Error: Your browser doesn't support geolocation."
    );
    this.infoWindow.open(this.map);
  }
}

function initMap() {
  document.addEventListener("DOMContentLoaded", function() {
    window.map = new Map();
  });
}