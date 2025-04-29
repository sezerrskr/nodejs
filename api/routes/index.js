var express = require('express');
var router = express.Router();

const fs = require("fs");

// /api/hello route'unu manuel olarak tanımla
router.get('/hello', (req, res) => {
  res.status(200).send('Hello, world!');
});

// Diğer route dosyalarını dinamik yükle
let routes = fs.readdirSync(__dirname);

for(let route of routes){
  if(route.includes(".js") && route != "index.js"){
    router.use("/"+route.replace(".js",""), require("./"+route));
  }
}

module.exports = router;
