var http    = require('http')
  , fs      = require('fs')
  , url     = require('url')
  , port    = 8080
  , scraper = require('./scraper.js')
  , admin   = require('firebase-admin')
  , express = require('express')
  , app     = express()

if (process.env.FIREBASE_KEY) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_KEY)),
    databaseURL: "https://webware-final-ajlockman.firebaseio.com"
  });
} else {
  admin.initializeApp({
    credential: admin.credential.cert("firebase.json"),
    databaseURL: "https://webware-final-ajlockman.firebaseio.com"
  });
}

// Firebase Query Methods
// TODO: implement firebase queries


// Express REST API
// TODO: implement REST API


// Express Web Site
app.get('/', function(req, res) {
  fs.readFile('index.html', function(error, content) {
    res.writeHead(200, {'Content-type': 'text/html'})
    res.end(content, 'utf-8')
  })
})

// Express setup
var server = app.listen(process.env.PORT || port, function () {
  var host = server.address().address
  var port = server.address().port
  console.log("Server listening at http://%s:%s", host, port)
})