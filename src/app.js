var UI = require('ui');
var Vector2 = require('vector2');
var ajax = require('ajax');
var Settings = require('settings');

// Set a configurable with just the close callback
Settings.config(
  { url: 'http://pgbunce.github.io/config_v1.html' },
  function(e) {
    console.log('closed configurable');

    // Show the parsed response
    //console.log(JSON.stringify(e.options));

    // Show the raw response if parsing failed
    if (e.failed) {
      console.log(e.response);
    }
  }
);
var API_KEY = 'apiKey';
localStorage.setItem(API_KEY, 'yqTCKCrJ8dpyCGnF33lf_HVArHY_kUcR');
var DB_KEY = 'dbKey';
localStorage.setItem(DB_KEY, 'bunce-nightscout-dev');
var COLLECTION_KEY = 'collKey';
localStorage.setItem(COLLECTION_KEY, 'bunce-2014');
var UNITS_KEY = 'unitsKey';
localStorage.setItem(UNITS_KEY, 'mg/dL');
var PWD_KEY = 'pwdKey';
localStorage.setItem(PWD_KEY, 'Syd');

// Create the Window
var window = new UI.Window({
  fullscreen: true
});

// Create a background Rect
var bgRect = new UI.Rect({
  position: new Vector2(0, 0),
  size: new Vector2(144, 166),
  backgroundColor: 'white'
});

// Add Rect to Window
window.add(bgRect);

var pwdRect = new UI.Text({
  position: new Vector2(0,0),
  size: new Vector2(144, 20),
  backgroundColor: 'black',
  color: 'white',
  font: 'gothic-18-bold',
  text: ''
});

window.add(pwdRect);

var sgvRect = new UI.Text({
  position: new Vector2(0,20),
  size: new Vector2(100, 50),
  color: 'black',
  font: 'bitham-42-bold',
  textAlign: 'center',
  text: '000'
});

window.add(sgvRect);

var trendImage = new UI.Image({
  position: new Vector2(100, 26),
  size: new Vector2(44,38),
  image: 'images/up.png',
  compositing: 'normal'
});

window.add(trendImage);

var deltaRect = new UI.Text({
  position: new Vector2(0,70),
  size: new Vector2(144, 20),
  color: 'black',
  font: 'gothic-18-bold',
  textAlign: 'center',
  text: '+0'
});

window.add(deltaRect);

var timeDeltaRect = new UI.Text({
  position: new Vector2(0,90),
  size: new Vector2(72, 20),
  color: 'black',
  font: 'gothic-18-bold',
  textAlign: 'left',
  text: '0m'
});

window.add(timeDeltaRect);

var noiseRect = new UI.Text({
  position: new Vector2(72,90),
  size: new Vector2(72, 20),
  color: 'black',
  font: 'gothic-18-bold',
  textAlign: 'right',
  text: 'noise'
});

window.add(noiseRect);

// Create TimeText
var timeText = new UI.TimeText({
  position: new Vector2(72, 146),
  size: new Vector2(72, 20),
  text: "%H:%M",
  font: 'gothic-18-bold',
  color: 'white',
  backgroundColor: 'black',
  textAlign: 'right'
});

// Add the TimeText
window.add(timeText);

var dateText = new UI.TimeText({
  position: new Vector2(0, 146),
  size: new Vector2(72, 20),
  text: "%a %d",
  font: 'gothic-18-bold',
  color: 'white',
  backgroundColor: 'black',
  textAlign: 'left'
});

// Add the TimeText
window.add(dateText);

// Show the Window
window.show();

var parseData = function(json) {
      // Extract data
  var sgv = json[0].sgv;
  sgvRect.text(sgv);
  var direction = json[0].direction;
  console.log("SGV is " + sgv + " " + direction);
  if (null != json[1]) {
    var prevSgv = json[1].sgv;
    var deltaSgv = Math.round(prevSgv - sgv);
    if (deltaSgv >= 0) {
      deltaRect.text('+' + deltaSgv + ' ' + localStorage.getItem(UNITS_KEY));      
    } else {
      deltaRect.text(deltaSgv + ' ' + localStorage.getItem(UNITS_KEY));      
    }
  }
  
  var newImage = "";
  switch(direction) {
        case 'Flat' : newImage = "flat"; break;
        case 'Up' : newImage = "up"; break;
        case 'FortyFiveUp' : newImage = "up45"; break;
        case 'FortyFiveDown' : newImage = "down45"; break;
        case 'Down' : newImage = "down"; break;
        case 'DoubleDown' : newImage = "downdown"; break;
        case 'DoubleUp' : newImage = "upup"; break;
  };
  trendImage.image('images/' + newImage + '.png');
  
  var epochTime = json[0].date;
  var epochNow = (new Date()).getTime();
  var timeDeltaSeconds = Math.round((epochNow - epochTime)/1000);
  if (Math.abs(timeDeltaSeconds) < 61) {
    timeDeltaRect.text('now');
  } else {
    var timeDeltaMinutes = Math.floor(timeDeltaSeconds / 60);
    timeDeltaRect.text(timeDeltaMinutes + 'm');
  }
  
  var noiseInt = json[0].noise;
  var noiseLvl = 'unknown';
  switch(noiseInt) {
    case 0: noiseLvl = 'None'; break;
    case 1: noiseLvl = 'Cln'; break;
    case 2: noiseLvl = 'Lgt'; break;
    case 3: noiseLvl = 'Med'; break;
    case 4: noiseLvl = 'Hvy'; break;
    case 5: noiseLvl = 'WmUp'; break;
    case 6: noiseLvl = 'Other'; break;
  };
  noiseRect.text(noiseLvl);
  
};

pwdRect.text(localStorage.getItem(PWD_KEY));

// Construct URL
var apiKey = localStorage.getItem(API_KEY);
if (null != apiKey) {
  var URL = 'https://api.mongolab.com/api/1/databases/' + localStorage.getItem(DB_KEY) + '/collections/' + localStorage.getItem(COLLECTION_KEY) + '?apiKey=' + apiKey + '&s=%7Bdate:-1%7D&l=2';
  console.log("URL: " + URL);
  // Download data
  ajax({url: URL, type: 'json'},
    function(json) {
      console.log('Ajax completed');
      parseData(json);
    },
    function(error) {
      console.log('Ajax failed: ' + error);
    }
  );
    
} else {
  console.log("API key is not set");
}

