const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
const ejs = require("ejs");
const https = require("https");

require("dotenv").config();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("home", { resultItems: recipes });
  chunks = [];
  recipes = [];
});
let searchCount = 0;
let chunks = [];
let recipes = [];

app.post("/", (req, res) => {
  searchCount++;
  const query = req.body.query;
  let minCaloriesQuery = req.body.minCaloriesQuery.toString();
  let maxCaloriesQuery = req.body.maxCaloriesQuery.toString();
  let diet = req.body.diet;
  let health = req.body.health;
  console.log(diet);
  console.log(health);
  if (minCaloriesQuery === "" && maxCaloriesQuery === "") {
    minCaloriesQuery = "0";
    maxCaloriesQuery = "10000";
  }
  let url =
    diet !== "any"
      ? `https://api.edamam.com/search?q=${query}&app_id=${process.env.APP_ID}&app_key=${process.env.API_KEY}&diet=${diet}&from=0&to=100`
      : `https://api.edamam.com/search?q=${query}&app_id=${process.env.APP_ID}&app_key=${process.env.API_KEY}&from=0&to=100`;
  url = health !== "any" ? url + `&health=${health}` : url;
  https.get(url, (response) => {
    response
      .on("data", (data) => {
        chunks.push(data);
      })
      .on("end", () => {
        let data = Buffer.concat(chunks);

        const queryData = data;
        const jsonQueryData = JSON.parse(queryData); //object is parsed
        const jsonQueryDataResults = jsonQueryData.hits; //array object, hits
        //There's something wrong with the parameters for calories
        jsonQueryDataResults.forEach((element) => {
          if (
            element.recipe.calories < minCaloriesQuery ||
            element.recipe.calories > maxCaloriesQuery
          )
            return;
          recipes.push(element.recipe);
        });
        // at this point recipes will be complete

        if (recipes[recipes.length - 1] === undefined && searchCount >= 1) {
          res.render("error", { query: query });
          chunks = [];
          recipes = [];
          labels = [];
          return;
        }
        console.log(res.statusCode);
        res.redirect("/");
      });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  `Server is running on Port ${PORT}`;
});
