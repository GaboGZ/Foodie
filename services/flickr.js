const axios = require("axios");
const { response } = require("express");
require('dotenv').config();

function build_image_url(photo_obj){
  let image_url = `http://farm${photo_obj.farm}.static.flickr.com/${photo_obj.server}/${photo_obj.id}_${photo_obj.secret}_s.jpg`
  return image_url;
}

// returns an image url string
async function getImage(query) {
  let photo = await getImages(query,1);
  let photo_url = photo.map(build_image_url);
  // console.log(photo_url[0]);  
  return (photo_url[0]) ? photo_url[0] : '#';
}

// Returns images object to be built after.
async function getImages(query, number) {
  const url = `https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=${flickr.api_key}&tags=${query}&per_page=${number}&format=json&media=photos&nojsoncallback=1`;
  // let photos = await axios.get(url);
  // return response.data.photos.photo;
  let photos = await axios
    .get(url)
    .then((response) => {
      return response.data.photos.photo;
    })
    .catch((error) => console.log(error));
  return photos;
}

// -------------------------------------------------------
const flickr = {
  api_key: process.env.FLICKR_API_KEY,
  methods: {
    build_image_url,
    getImage,
    getImages,
  },
};

module.exports = flickr.methods;
