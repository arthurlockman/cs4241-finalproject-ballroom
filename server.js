var http    = require('http')
  , fs      = require('fs')
  , url     = require('url')
  , port    = 8080
  , admin   = require('firebase-admin')
  , express = require('express')
  , app     = express()
  , router  = express.Router()

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

var db = admin.database()
var worcesterRef = db.ref("/worcester")
var worcester = []
loadDataForCompetition('worcester')
var tufts = []
loadDataForCompetition('tufts')
var mit = []
loadDataForCompetition('mit')
var brown = []
loadDataForCompetition('brown')
var harvard = []
loadDataForCompetition('harvard')

// Firebase Query Methods
// TODO: implement firebase queries
function loadDataForCompetition(compName) {
  console.log('Loading ' + compName)
  db.ref(compName).once('value', function(v) {
    switch (compName){
      case 'worcester':
        worcester = v.val()
        break
      case 'tufts':
        tufts = v.val()
        break
      case 'mit':
        mit = v.val()
        break
      case 'brown':
        brown = v.val()
        break
      case 'harvard':
        harvard = v.val()
        break
    }
    console.log('Done loading ' + compName)
  })
}

// Dataset building Methods
function buildDataForRound(competition, roundName) {
  return(competition)
}

// Express REST API
// TODO: implement REST API
router.route('/competition/:comp_id/:round_name').get(function(req, res) {
  switch (req.params.comp_id){
    case 'worcester':
      res.send(buildDataForRound(worcester, req.params.round_name))
      break
    case 'tufts':
      res.send(buildDataForRound(tufts, req.params.round_name))
      break
    case 'mit':
      res.send(buildDataForRound(mit, req.params.round_name))
      break
    case 'brown':
      res.send(buildDataForRound(brown, req.params.round_name))
      break
    case 'harvard':
      res.send(buildDataForRound(harvard, req.params.round_name))
      break
    default:
      var d = {
        "response": "no data found"
      }
      res.send(d)
  }
})

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

app.use('/api', router)
