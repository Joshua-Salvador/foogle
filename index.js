const express = require("express");
const bodyParser =require("body-parser");
const _ = require("lodash");
const ejs = require("ejs");
const https = require("https");

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine", "ejs");


app.get("/", (req, res) => {  
  res.render("home", {resultItems: recipes});
  chunks = [];
  recipes = [];
});
let searchCount = 0;
let chunks = [];
let recipes = [];

app.post("/", (req, res) => {
  searchCount++;
  const query = req.body.query;
  const url = "https://api.edamam.com/search?q=" + query + "&app_id=49bb64d6&app_key=690efc729296d5671753022db574e8e4&from=0&to=100";
  https.get(url, (response) => {
    response.on("data", (data) => {
      chunks.push(data);
    }).on('end', () => {
      let data = Buffer.concat(chunks);
      
      const queryData = data;
      const jsonQueryData = JSON.parse(queryData); //object is parsed
      const jsonQueryDataResults = jsonQueryData.hits; //array object
      jsonQueryDataResults.forEach(element => {
        recipes.push(element.recipe);
      });
      // at this point recipes will be complete

      if(recipes[recipes.length - 1] === undefined && searchCount >= 1) {
        res.render("error", {query:query}); 
        chunks = [];
        recipes = [];
        labels = [];
        return
      }
      res.redirect("/");
    })
  })

});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {`Server is running on Port ${PORT}`});