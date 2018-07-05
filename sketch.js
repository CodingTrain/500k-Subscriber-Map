// Daniel Shiffman
// http://codingtra.in
// http://patreon.com/codingtrain

// Subscriber Mapping Visualization
// https://youtu.be/Ae73YY_GAU8

let youtubeData;
let countries;

const mappa = new Mappa('Leaflet');
let trainMap;
let canvas;

let data = [];

let select;

let currentColor;

const options = {
  lat: 0,
  lng: 0,
  zoom: 1.5,
  style: "http://{s}.tile.osm.org/{z}/{x}/{y}.png"
}

function preload() {
  // youtubeData = loadTable('subscribers_geo.csv', 'header');
  youtubeData = loadTable('watch_time_geo.csv', 'header');
  countries = loadJSON('countries.json');

}

function setup() {
  canvas = createCanvas(800, 600);
  trainMap = mappa.tileMap(options);
  trainMap.overlay(canvas);

  select = createSelect();
  select.option('Subscribers');
  select.option('Watch Time');
  select.option('Views');
  select.changed(processData);

  currentColor = color(255, 0, 200, 100); // default color 
  processData();
}

function draw() {
  clear();
  for (let country of data) {
    const pix = trainMap.latLngToPixel(country.lat, country.lon);
    fill(currentColor);
    const zoom = trainMap.zoom();
    const scl = pow(2, zoom); // * sin(frameCount * 0.1);
    ellipse(pix.x, pix.y, country.diameter * scl);
  }
}

function processData() {
  data = []; // always clear the array when picking a new type

  let type = (() => {
    switch (select.value()) {
      case 'Views':
        currentColor = color(255, 0, 200, 100);
        return 'views';
      case 'Watch Time':
        currentColor = color(200, 0, 100, 100);
        return 'watch_time_minutes';
      case 'Subscribers':
        currentColor = color(64, 250, 200, 100);
        return 'subscribers';
    }
  })(); // neat way to assign value, based on a switch case 


  let maxValue = 0; // changed to something more generic, as we no longer only work with subs
  let minValue = Infinity;

  for (let row of youtubeData.rows) {
    let country = row.get('country_id').toLowerCase();
    let latlon = countries[country];
    if (latlon) {
      let lat = latlon[0];
      let lon = latlon[1];
      let count = Number(row.get(type));
      data.push({
        lat,
        lon,
        count
      });
      if (count > maxValue) {
        maxValue = count;
      }
      if (count < minValue) {
        minValue = count;
      }
    }
  }

  let minD = sqrt(minValue);
  let maxD = sqrt(maxValue);

  for (let country of data) {
    country.diameter = map(sqrt(country.count), minD, maxD, 1, 20);
  }
}
