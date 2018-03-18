#!/usr/bin/env node

const http = require('https');
const download = require('image-downloader');
const _ = require('lodash');

var express = require('express'),
  app = express(),
  bodyParser = require('body-parser'),
  errorHandler = require('errorhandler'),
  methodOverride = require('method-override'),
  hostname = process.env.HOSTNAME || 'localhost',
  port = parseInt(process.env.PORT, 10) || 4567,
  publicDir = process.argv[2] || __dirname + '/public',
  path = require('path');

app.get('/', function (req, res) {
  res.sendFile(path.join(publicDir, '/index.html'));
});

app.use(methodOverride());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(express.static(publicDir));
app.use(
  errorHandler({
    dumpExceptions: true,
    showStack: true
  })
);

console.log('Simple static server showing %s listening at http://%s:%s', publicDir, hostname, port);
app.listen(port, hostname);

const downloadOptions = {
  url: '',
  dest: 'C:/full/path/to/cryptocurrency-logos/images'
};
const url = 'https://min-api.cryptocompare.com/data/all/coinlist';
let current = 0;
const coins = [];
let baseImageUrl = '';

http
  .get(url, function (res) {
    let body = '';
    res.on('data', function (chunk) {
      body += chunk;
    });
    res.on('end', function () {
      var response = JSON.parse(body);
      prepareData(response);
    });
  })
  .on('error', function (e) {
    console.log('Got an error: ', e);
  });

const prepareData = data => {
  baseImageUrl = data.baseImageUrl;
  _.forEach(data.Data, function (value, key) {
    coins.push(value);
  });
  downloadImage();
};
const handleNext = () => {
  if (current < coins.length - 1) {
    current++;
    downloadImage();
  }
}
const downloadImage = () => {
  downloadOptions.url = baseImageUrl + coins[current].ImageUrl;
  download
    .image(downloadOptions)
    .then(({ filename, image }) => {
      console.log('File saved to', filename);
      handleNext();
    })
    .catch(err => {
      // Don't care, get next one
      console.log('error', err);
      handleNext();
    });
};
