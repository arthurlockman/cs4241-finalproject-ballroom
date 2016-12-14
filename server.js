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
  var rounds = []
  var dances = []
  var rne = ""
  var compDances = []
  for (i = 0; i < competition.length; i++) {
    var round = competition[i]
    var roundNameExtracted = round.roundInfo[0].roundName
    if (roundName.toLowerCase() == roundNameExtracted.toLowerCase())
    {
      rounds.push(round)
      rne = roundNameExtracted
    }
  }
  for (i = 0; i < rounds.length; i++) {
    var round = rounds[i]
    for (j = 0; j < round.roundInfo.length; j++) {
      var dance = round.roundInfo[j]
      if (!dances[dance.dances[0].danceName]){
        dances[dance.dances[0].danceName] = []
      }
      dances[dance.dances[0].danceName].push(dance)
    }
  }
  for (dance in dances) {
    var competitors = []
    for (i = 0; i < dances[dance].length; i++)
    {
      var d = dances[dance][i]
      var nc = {
        "name_1": d.name_1,
        "name_2": d.name_2,
        "coupleNumber": d.coupleNumber,
        "advanced": d.advance,
        "totalMarks": d.dances[0].totalMarks,
        "marks": d.dances[0].judgeMarkData
      }
      competitors.push(nc)
    }
    var rd = {
      "danceName": dance,
      "competitors": competitors
    }
    compDances.push(rd)
  }

  var returnData = {
    "competitionName": competition[0].competitionInfo.name,
    "competitionDate": competition[0].competitionInfo.date,
    "roundName": rne,
    "skill": competition[0].eventInfo.skill,
    "dances": compDances
  }
  return(JSON.stringify(returnData))
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
