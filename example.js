var express = require('express');
var googlehome = require('./google-home-notifier');
var ngrok = require('ngrok');
var bodyParser = require('body-parser');
var app = express();
var serverPort = 8080;

var server = googlehome.server(port = serverPort);
googlehome.device(ip = '192.168.0.4');
googlehome.language(lang = 'ja-JP', name = 'ja-JP-Wavenet-B', pitch = -3.2, speakingRate = 1.11);

var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(express.static('public'));

app.post('/google-home-notifier', urlencodedParser, function (req, res) {
  if (!req.body) return res.sendStatus(400)
  console.log(req.body);
  var text = req.body.text;
  if (text){
    try {
      googlehome.notify(text, function(notifyRes) {
        console.log(notifyRes);
        res.send('Google home will say: ' + text + '\n');
      });
    } catch(err) {
      console.log(err);
      res.sendStatus(500);
      res.send(err);
    }
  }else{
    res.send('Please POST "text=Hello Google Home"');
  }

})

app.listen(serverPort, function () {
  connectNgrok()
})

async function connectNgrok() {
  const url = await ngrok.connect(serverPort);
  console.log('POST "text=Hello Google Home" to:');
  console.log('    http://localhost:' + serverPort + '/google-home-notifier');
  console.log('    ' +url + '/google-home-notifier');
  console.log('example:');
  console.log('curl -X POST -d "text=Hello Google Home" ' + url + '/google-home-notifier');
}
