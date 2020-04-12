var Client = require('castv2-client').Client;
var DefaultMediaReceiver = require('castv2-client').DefaultMediaReceiver;
var mdns = require('mdns');
var browser = mdns.createBrowser(mdns.tcp('googlecast'));
var os = require('os');
// Imports the Google Cloud client library
const textToSpeech = require('@google-cloud/text-to-speech');
// Import other required libraries
const fs = require('fs');
const util = require('util');

var serverPort;
var languageCode;
var voiceName;
var voicePitch;
var voiceSpeakingRate;
var deviceAddress;
var localAddress;

var language = function(lang = 'ja-JP', name = 'ja-JP-Wavenet-B', pitch = -3.2, speakingRate = 1.11) {
  languageCode = lang;
  voiceName = name;
  voicePitch = pitch;
  voiceSpeakingRate = speakingRate;
  return this;
};

var device = function(name = '', ip = '192.168.0.4') {
  device = name;
  deviceAddress = ip;
  return this;
};

var server = function(port = 8080, ip = getLocalAddress()[0].address) {
  serverPort = port;
  localAddress = ip;
  return this;
};

function getLocalAddress() {
  var ipv4 = [];
  var interfaces = os.networkInterfaces();

  for (var dev in interfaces) {
    interfaces[dev].forEach(function(details){
      if (!details.internal){
        switch(details.family){
        case "IPv4":
          ipv4.push({name:dev, address:details.address});
          break;
        }
      }
    });
  }
  return ipv4;
};

const client = new textToSpeech.TextToSpeechClient();
async function synthesis(text) {

  // Construct the request
  const request = {
    input: {text: text},
    // Select the language and SSML voice gender (optional)
    voice: {languageCode: languageCode, name: voiceName},
    // select the type of audio encoding
    audioConfig: {audioEncoding: 'MP3', // 'LINEAR16'
                  effectsProfileId: ['medium-bluetooth-speaker-class-device'],
                  pitch: voicePitch,
                  speakingRate: voiceSpeakingRate
                 },
  };

  // Performs the text-to-speech request
  const [response] = await client.synthesizeSpeech(request);
  // Write the binary audio content to a local file
  const writeFile = util.promisify(fs.writeFile);
  await writeFile('public/output.mp3', response.audioContent, 'binary');
  return 'http://' + localAddress + ':' + serverPort + '/output.mp3';
}

var notify = function(message, callback) {
  if (!deviceAddress){
    browser.start();
    browser.on('serviceUp', function(service) {
      console.log('Device "%s" at %s:%d', service.name, service.addresses[0], service.port);
      if (service.name.includes(device.replace(' ', '-'))){
        deviceAddress = service.addresses[0];
        getSpeechUrl(message, deviceAddress, function(res) {
          callback(res);
        });
      }
      browser.stop();
    });
  }else {
    getSpeechUrl(message, deviceAddress, function(res) {
      callback(res);
    });
  }
};

var play = function(mp3_url, callback) {
  if (!deviceAddress){
    browser.start();
    browser.on('serviceUp', function(service) {
      console.log('Device "%s" at %s:%d', service.name, service.addresses[0], service.port);
      if (service.name.includes(device.replace(' ', '-'))){
        deviceAddress = service.addresses[0];
        getPlayUrl(mp3_url, deviceAddress, function(res) {
          callback(res);
        });
      }
      browser.stop();
    });
  }else {
    getPlayUrl(mp3_url, deviceAddress, function(res) {
      callback(res);
    });
  }
};

var getSpeechUrl = function(text, host, callback) {
  synthesis(text).then(function (url) {
    onDeviceUp(host, url, function(res){
      callback(res)
    });
  }).catch(function (err) {
    console.error(err.stack);
  });
};

var getPlayUrl = function(url, host, callback) {
  onDeviceUp(host, url, function(res){
    callback(res)
  });
};

var onDeviceUp = function(host, url, callback) {
  var client = new Client();
  client.connect(host, function() {
    client.launch(DefaultMediaReceiver, function(err, player) {

      var media = {
        contentId: url,
        contentType: 'audio/mp3',
        streamType: 'BUFFERED' // or LIVE
      };
      player.load(media, { autoplay: true }, function(err, status) {
        client.close();
        callback('Device notified');
      });
    });
  });

  client.on('error', function(err) {
    console.log('Error: %s', err.message);
    client.close();
    callback('error');
  });
};

exports.language = language;
exports.device = device;
exports.server = server;
exports.notify = notify;
exports.play = play;
exports.synthesis = synthesis;
