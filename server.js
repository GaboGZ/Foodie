const express = require("express");
const app = express();
const createError = require('http-errors');
const path = require("path");

const routes = require("./routes");
require('dotenv').config();

const bodyParser = require("body-parser");

const hostname = "127.0.0.1";
const PORT = 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./views"));
app.set("trust proxy", 1); // makes express trust cookies throu a reverse proxy

app.locals.siteName = 'Foodie Time';

app.use(express.static(path.join(__dirname, "./public")));
app.use(express.static(path.join(__dirname, "./public/images")));
app.use(express.static(path.join(__dirname, "./public/js")));


app.use("/", routes(PORT));
app.use(bodyParser.json());

app.post("/post-search", (req, res) => {
  console.log(req.body);
  res.sendStatus(200);
});

app.use((req, res, next) => {
  // console.log('Error 404');
  return next(createError(404,'File not Found'));
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  // console.error(err);
  const status = err.status || 500;
  res.locals.status = status;
  res.status(status);
  res.render('error');
})

app.listen(PORT, () => {
  console.log(`Express server listening at http://${hostname}:${PORT}/`);
});
