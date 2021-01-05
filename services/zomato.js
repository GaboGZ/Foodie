const flickr = require("../services/flickr");
const axios = require("axios");
require('dotenv').config();

const categories_json = require("../data/categories.json");
const { response } = require("express");
const config = {
  headers: {
    "user-key": process.env.ZOMATO_API_KEY,
  },
};

async function getLocalCategories() {
  return categories_json;
}

async function getCategories() {
  let url = "https://developers.zomato.com/api/v2.1/categories";
  let response = await axios.get(url, config);
  let categories = response.data.categories; //array
  return categories;
}

async function sendMessage() {
  console.log("A method from Zomato!");
}

async function getCityByName(city_name) {
  let url = `https://developers.zomato.com/api/v2.1/cities?q=${city_name}`;
  return axios
    .get(url, config)
    .then((response) => {
      // console.log(response);
      return response.data.location_suggestions[0];
    })
    .catch((error) => console.log(error));
}

async function getCityCollections(city_name) {
  let city = await getCityByName(city_name);
  // console.log("\n" + city_name + city);
  let url = `https://developers.zomato.com/api/v2.1/collections?city_id=${city.id}`;
  let response = await axios.get(url, config);
  // console.log(response.data.collections);
  if (response.data.collections) {
    return response.data.collections;
  }
  return false;
}

async function getCityCuisines(city_name) {
  let city = await getCityByName(city_name);
  // console.log(city);
  let url = `https://developers.zomato.com/api/v2.1/cuisines?city_id=${city.id}`;
  let response = await axios.get(url, config);
  // console.log(response.data.cuisines);
  if (response.data.cuisines) {
    return response.data.cuisines;
  }
  return false;
}

async function getRestaurantDetails(restaurant_id){
  let url = `https://developers.zomato.com/api/v2.1/restaurant?res_id=${restaurant_id}`;
  let response = await axios.get(url,config);
  return response.data; 
}

async function search(city_name, query, count, lat, lon, sort, order) {
  let city = await getCityByName(city_name);
  let url = `https://developers.zomato.com/api/v2.1/search?entity_id=${city.id}&entity_type=city&q=${query}}&count=${count}&lat=${lat}&lon=${lon}&sort=${sort}&order=${order}`;
  let response = await axios.get(url, config);
  // console.log(response.data);
  return response.data;
}

const zomato = {
  methods: {
    getLocalCategories,
    getCategories,
    getCityByName,
    getCityCollections,
    getCityCuisines,
    getRestaurantDetails,
    search,
    sendMessage,
  },
};

module.exports = zomato.methods;
