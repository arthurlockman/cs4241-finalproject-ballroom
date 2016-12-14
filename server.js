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
// loadDataForCompetition('tufts')
var mit = []
// loadDataForCompetition('mit')
var brown = []
// loadDataForCompetition('brown')
var harvard = []
// loadDataForCompetition('harvard')
var searchTable = buildSearchTable(worcester, tufts, mit, brown, harvard)

// Firebase Query Methods
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
function buildSearchTable() {
  var table = []
  for (i = 0; i < arguments.length; i++) {
    var comp = arguments[i]
    var d = {
      "name": "temp" + i,
      "link": "/api/temp",
      "type": "temp"
    }
    table.push(d)
  }
  return table
}

function buildDataForRound(competition, roundName, year, skill) {
  var rounds = []
  var dances = []
  var rne = ""
  var compDances = []
  for (i = 0; i < competition.length; i++) {
    var round = competition[i]
    var roundNameExtracted = round.roundInfo[0].roundName
    var roundYear = round.competitionInfo.year
    var roundSkill = round.eventInfo.skill
    if (roundName.toLowerCase().replace('.', '/') == roundNameExtracted.toLowerCase() && roundYear == year
        && roundSkill.toLowerCase() == skill.toLowerCase())
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
    "skill": rounds[0].eventInfo.skill,
    "dances": compDances
  }
  return(JSON.stringify(returnData))
}

function buildDataForRoundTop(competition, roundName, year) {
  var rounds = []
  var dances = []
  var rne = ""
  var compDances = []
  var roundSkills = new Set()
  for (i = 0; i < competition.length; i++) {
    var round = competition[i]
    var roundNameExtracted = round.roundInfo[0].roundName
    var roundYear = round.competitionInfo.year
    var roundSkill = round.eventInfo.skill
    if (roundName.toLowerCase().replace('.', '/') == roundNameExtracted.toLowerCase() && roundYear == year)
    {
      roundSkills.add(roundSkill)
      rne = roundNameExtracted
    }
  }
  var r = {
    skills: Array.from(roundSkills)
  }
  return(JSON.stringify(r))
}

function buildDataForCompetition(competition, year) {
  var rounds = new Set()
  var competitors = new Set()
  var judges = new Set()
  var r = []
  for (i = 0; i < competition.length; i++) {
    var round = competition[i]
    var roundYear = round.competitionInfo.year
    if (roundYear == year)
    {
      r.push(round)
    }
  }
  for (i = 0; i < r.length; i++) {
    var round = r[i]
    var roundNameExtracted = round.roundInfo[0].roundName
    rounds.add(roundNameExtracted.replace('/', '.'))
    for (j = 0; j < round.roundInfo.length; j++) {
      var element = round.roundInfo[j]
      competitors.add(element.name_1)
      competitors.add(element.name_2)
      var jmd = element.dances[0].judgeMarkData
      for (judge in jmd) {
        judges.add(judge)
      }
    }
  }
  rounds = Array.from(rounds)
  competitors = Array.from(competitors)
  judges = Array.from(judges)
  var r = {
    "competitionName": competition[0].competitionInfo.name,
    "competitionDate": competition[0].competitionInfo.date,
    "rounds": rounds,
    "competitors": competitors,
    "judges": judges
  }
  return(JSON.stringify(r))
}

// Express REST API
// TODO: implement REST API
router.route('/competition/:year/:comp_id/:round_name/:skill').get(function(req, res) {
  switch (req.params.comp_id){
    case 'worcester':
      res.send(buildDataForRound(worcester, req.params.round_name, req.params.year, req.params.skill))
      break
    case 'tufts':
      res.send(buildDataForRound(tufts, req.params.round_name, req.params.year, req.params.skill))
      break
    case 'mit':
      res.send(buildDataForRound(mit, req.params.round_name, req.params.year, req.params.skill))
      break
    case 'brown':
      res.send(buildDataForRound(brown, req.params.round_name, req.params.year, req.params.skill))
      break
    case 'harvard':
      res.send(buildDataForRound(harvard, req.params.round_name, req.params.year, req.params.skill))
      break
    default:
      var d = {
        "response": "no data found"
      }
      res.send(d)
  }
})

router.route('/competition/:year/:comp_id/:round_name').get(function(req, res) {
  switch (req.params.comp_id){
    case 'worcester':
      res.send(buildDataForRoundTop(worcester, req.params.round_name, req.params.year))
      break
    case 'tufts':
      res.send(buildDataForRoundTop(tufts, req.params.round_name, req.params.year))
      break
    case 'mit':
      res.send(buildDataForRoundTop(mit, req.params.round_name, req.params.year))
      break
    case 'brown':
      res.send(buildDataForRoundTop(brown, req.params.round_name, req.params.year))
      break
    case 'harvard':
      res.send(buildDataForRoundTop(harvard, req.params.round_name, req.params.year))
      break
    default:
      var d = {
        "response": "no data found"
      }
      res.send(d)
  }
})

router.route('/competition/:year/:comp_id').get(function(req, res) {
  switch (req.params.comp_id){
    case 'worcester':
      res.send(buildDataForCompetition(worcester, req.params.year))
      break
    case 'tufts':
      res.send(buildDataForCompetition(tufts, req.params.year))
      break
    case 'mit':
      res.send(buildDataForCompetition(mit, req.params.year))
      break
    case 'brown':
      res.send(buildDataForCompetition(brown, req.params.year))
      break
    case 'harvard':
      res.send(buildDataForCompetition(harvard, req.params.year))
      break
    default:
      var d = {
        "response": "no data found"
      }
      res.send(d)
  }
})

router.route('/search/:query').get(function(req, res) {
  var query = req.params.query
  var r = []
  console.log(query)
  console.log(JSON.stringify(searchTable))
  for (i = 0; i < searchTable.length; i++) {
    val = searchTable[i]
    if (val.name.indexOf(query) > -1)
    {
      r.push(val)
    }
  }
  res.send(JSON.stringify(r))
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

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
})

app.use('/api', router)
