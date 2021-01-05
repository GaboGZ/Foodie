const express = require("express");
const router = express.Router();
const path = require("path");

// require('dotenv').config();

const flickr = require("../services/flickr");
const zomato = require("../services/zomato");

const options = {
  sortOptions: ["rating", "cost"],
  orderOptions: ["asc", "desc"],
  cities: [
    { city_name: "Adelaide", lat: -34.928, lon: 138.600 },
    { city_name: "Brisbane", lat: -27.469, lon: 153.025 },
    { city_name: "Canberra", lat: -35.280, lon: 149.130 },
    { city_name: "Gold Coast", lat: -28.000, lon: 153.400 },
    { city_name: "Melbourne", lat: -37.813, lon: 144.963 },
    { city_name: "Newcastle", lat: -32.928, lon: 151.781 },
    { city_name: "Perth", lat: -31.950, lon: 115.860 },
    { city_name: "Sydney", lat: -33.868, lon: 151.209 }
  ]
};

module.exports = (PORT) => {
  router.get("/", (req, res, next) => {
    zomato.getCategories().then((data) => {
      categories = data;

      try {
        const response = Promise.all(
          options.cities.map((item) =>
            flickr.getImage(item.city_name).then((image) => image)
          )
        ).then((images) => {
          const cities = images.map((image, i) => {
            const obj = {
              city_name: options.cities[i].city_name,
              image_url: image,
            };
            return obj;
          });

          // console.log("--------------");
          // console.log(cities);

          res.render("layout", {
            pageTitle: "Home",
            template: "index",
            path: "search",
            options,
            cities,
            city: "Brisbane",
            request: {},
            categories,
            google_key: process.env.GOOGLE_API_KEY
          });
        });
      } catch (error) {
        res.send(error);
      }
    });
  });

  router.get("/category/:id", (req, res) => {
    res.send({ category_id: req.params.id });
  });

  // Display a list of collection in a given city
  router.get("/city", (req, res, next) => {
    let city = req.query.query;

    // console.log("Query: " + city);
    zomato
      .getCityCollections(city)
      .then((response) => {
        let template = response ? "collections" : "no-results";
        res.render("layout", {
          pageTitle: "Collections",
          template,
          path: "search",
          request: {},
          cities: options.cities,
          options,
          city,
          collections: response,
          google_key: process.env.GOOGLE_API_KEY
        });
      })
      .catch((error) => console.log(error));
  });

  router.get("/city/list", (req, res, next) => {
    let city = req.query.query;
    // console.log(city);
    zomato.getCategories().then((data) => {
      categories = data;
      try {
        const response = Promise.all(
          options.cities.map((item) =>
            flickr.getImage(item.city_name).then((image) => image)
          )
        ).then((images) => {
          const cities = images.map((image, i) => {
            const obj = {
              city_name: options.cities[i].city_name,
              image_url: image,
            };
            return obj;
          });

          // console.log("--------------");
          // console.log(cities);

          res.render("layout", {
            pageTitle: "Cities",
            template: "index",
            path: "search",
            options,
            cities,
            city: "Sydney",
            request: {},
            categories,
            // google_key: process.env.GOOGLE_API_KEY
          });
        });
      } catch (error) {
        res.send(error);
      }
    });
  });

  // Display a list of cuisines in a given city
  router.get("/cuisines/list", (req, res, next) => {
    let city = "Brisbane";
    // let lat = req.query.lat;
    // let lon = req.query.lon;
    // console.log("Query: " + req.query);
    zomato.getCityCuisines(city).then((response) => {
      cuisines = response;
      Promise.all(
        cuisines.map((item) =>
          flickr.getImage(item.cuisine.cuisine_name + "+food")
        )
      ).then((images) => {
        const c = cuisines.map((item, i) => {
          // console.log(item.cuisine);
          const obj = {
            cuisine_name: item.cuisine.cuisine_name,
            image_url: images[i],
          };
          return obj;
        });

        // console.log(c);
        res.render("layout", {
          pageTitle: "Cuisines",
          template: "cuisines",
          path: "cuisines",
          request: {},
          cities: options.cities,
          options,
          city,
          cuisines: c,
          // google_key: process.env.GOOGLE_API_KEY
        });
      });
    });
  });

  // Display a list of cuisines in a given city
  router.get("/cuisines", (req, res, next) => {
    let city = req.query.query;
    // console.log("Query: " + city);
    zomato.getCityCuisines(city).then((response) => {
      // console.log(response);
      let template = response ? "cuisines" : "no-results";
      res.render("layout", {
        pageTitle: "Cuisines",
        template,
        path: "cuisines",
        request: {},
        options,
        city: "",
        cuisines: response,
        google_key: process.env.GOOGLE_API_KEY
      });
    });
  });

  router.get("/restaurants", (req, res, next) => {
    // console.log(req.query);
    let city = req.query.city;
    let query = req.query.query;
    let count = req.query.number;
    let lat = req.query.lat;
    let lon = req.query.lon;
    let request = req.query;
    let sort = req.query.sort;
    let order = req.query.order;
    zomato
      .search(city, query, count, lat, lon, sort, order)
      .then((response) => {
        let template = response ? "restaurants" : "no-results";
        res.render("layout", {
          pageTitle: "Restaurants",
          template,
          request,
          path: "",
          request,
          options,
          cities: options.cities,
          city,
          restaurants: response,
          // google_key: process.env.GOOGLE_API_KEY
        });
      });
  });

  router.get("/restaurants/view", (req, res, next) => {
    // console.log(req.query);
    let restaurant_id = req.query.query;
    let request = req.query;
    let city = req.query.city;

    zomato
      .getRestaurantDetails(restaurant_id)
      .then((response) => {
        // res.send(response);
        // console.log(response);
        let template = response ? "restaurant" : "no-results";
        let restaurant = response;
        // console.log(cuisines);
        cuisines = restaurant.cuisines.replace(", ", "+");

        flickr.getImages(cuisines+"+food",4).then((data) => {
          const images = data.map((item) => flickr.build_image_url(item));
          // console.log(data); //response from flickr
          // console.log(images); 
          res.render("layout", {
            pageTitle: restaurant.name + " | " + city,
            template,
            request,
            path: "/",
            request,
            options,
            cities: options.cities,
            city,
            restaurant,
            images,
            // google_key: process.env.GOOGLE_API_KEY
          });
        });
      })
      .catch((error) => console.log(error));
  });

  router.get("/photo-search", (req, res) => {
    const query = req.query["query"];
    // console.log("Query: " + query);
    // Request some pictures
    flickr
      .getImages(query, 10)
      .then((photos) => {
        // console.log(photos);
        res.render("layout", {
          pageTitle: "Home",
          template: "search-results",
          request: {},
          cities: options.cities,
          city: "Brisbane",
          path: "/",
          options,
          photos,
          query,
          // google_key: process.env.GOOGLE_API_KEY
        });
      })
      .catch((error) => console.log(error));
  });

  router.get("/search", (req, res, next) => {
    let city = req.query["city"];
    let query = req.query["query"];
    let count = req.query["number"];
    let lat = req.query["lat"];
    let lon = req.query["lon"];
    let sort = "rating";
    let order = "desc";
    // let request = req.query;
    res.redirect(
      `http://localhost:${PORT}/restaurants?query=${query}&city=${city}&count=${count}&lat=${lat}&lon=${lon}&sort=${sort}&order=${order}`
    );
  });

  router.get("/restaurants/search", (req, res, next) => {
    let city = req.query["city"];
    let query = req.query["query"];
    let count = req.query["number"];
    let lat = req.query["lat"];
    let lon = req.query["lon"];
    let sort = "rating";
    let order = "desc";
    // let request = req.query;
    res.redirect(
      `http://localhost:${PORT}/restaurants?query=${query}&city=${city}&count=${count}&lat=${lat}&lon=${lon}&sort=${sort}&order=${order}`
    );
  });

  router.get("/cuisines/search", (req, res, next) => {
    let city = req.query["city"];
    let query = req.query["query"];
    let count = req.query["number"];
    let lat = req.query["lat"];
    let lon = req.query["lon"];
    let sort = "rating";
    let order = "desc";
    // let request = req.query;
    res.redirect(
      `http://localhost:${PORT}/restaurants?query=${query}&city=${city}&count=${count}&lat=${lat}&lon=${lon}&sort=${sort}&order=${order}`
    );
  });

  return router;
};
