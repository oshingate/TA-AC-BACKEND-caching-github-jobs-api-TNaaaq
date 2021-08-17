const { default: axios } = require('axios');
let express = require('express');

//importing redis

let redis = require('redis');

var starwarsURL = 'https://swapi.dev/api/';

var app = express();

//using redis.createClient() method

let client = redis.createClient(6379);

//logging if any error

client.on('error', (err) => {
  console.log(err);
});

app.get('/', (req, res) => {
  res.send('<h1>Hello Welcome to Redis Cache </h1>');
});

//middleware to check data is present in cache

var checkCache = (req, res, next) => {
  let search = req.params.search;
  client.get(search, (err, data) => {
    if (err) throw err;
    if (!data) {
      return next();
    } else {
      return res.json({ data: JSON.parse(data), info: 'data from cache' });
    }
  });
};

app.get('/starwars/:search', checkCache, async (req, res) => {
  let search = req.params.search;

  let data = await axios(starwarsURL + search);

  //caching received data using redis

  client.setex(search, 600, JSON.stringify(data.data));

  res.json({ data: data.data, info: 'data from 3rd party API' });
});

app.listen(3000, () => {
  console.log('server is live on port 3000');
});
