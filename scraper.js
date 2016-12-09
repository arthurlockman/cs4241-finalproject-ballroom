var express = require('express')
var fs      = require('fs')
var request = require('request')
var cheerio = require('cheerio')
var cheerioTableparser = require('cheerio-tableparser')
var querystring = require('querystring')
var parser = require('./parser.js');



module.exports = {
  scrape
}

/* GLOBALS */
const COMPETITION_YEAR_SELECTOR = '.h3'
,     COMPETITION_DATE_SELECTOR = 'td:nth-child(3)'

ROOT_URL = 'http://www.o2cm.com/results/'
LOG = false
NO_SELECTOR = -9999;
PRINT_RESULTS = true
// COMP_SEARCH_STRING = 'Tufts University Ballroom CompetitionNovember 13th'
COMP_SEARCH_STRING = 'Tufts'



/* SCRIPT ENTRANCE */
var d = new Date();
var startTime = d.getTime();

scrape().then(function() {
  d = new Date();
  var endTime = d.getTime();

  console.log('\n\n************************************')
  console.log("Total time: " + (endTime - startTime) + " ms")
  console.log('************************************\n\n')
})

/* END SCRIPT */


function scrape() {

  // Load the main page
  return loadMainPage_Promise(ROOT_URL)

  // Extract the competition URLs and perform next step
  .then(forEveryCompetitionPage)
}

// Load the main page into memory
function loadMainPage_Promise(url) {
  return new Promise(function(resolve, reject){

    // Perform the asynch request
    request(url, function(error, response, html){

      // Load the page
      var ROOT_PAGE = cheerio.load(html)
      // var ROOT_PAGE = cheerio.load(fs.readFileSync('competitions_page.html'))

      // Return the page
      resolve(ROOT_PAGE)
      
    })
  })
}

function forEveryCompetitionPage(ROOT_PAGE) {
  // Extract the competition URLs and other info
  var gen = competitionLinkGenerator(ROOT_PAGE)
  while(true) {
    var next = gen.next()

    if(next.done == true){
      break
    }
    else {
      // TODO keep track of info here
      var competitionInfo = next.value
      var ref = competitionInfo.ref

      // Load each competition page
      loadCompetitionPage_Promise(ROOT_URL, ref, competitionInfo)

      // Extract the event URLs and perform next step
      .then(function(tuple) {
        var COMPETITION_PAGE = tuple[0]
        var competitionInfo = tuple[1]
        forEveryEventPage(COMPETITION_PAGE, competitionInfo)
      })
    }
  }
}

// ROOT_URL: http://www.o2cm.com/results/
// ref = event3.asp?event=sib16
function loadCompetitionPage_Promise(ROOT_URL, ref, competitionInfo) {

  var details = ref.split('?')
  var eventName = details[1].split('=')[1]
  var URI = ROOT_URL + details[0]

  var formDetails = { 
  selDiv: "", 
  selAge: "", 
  selSkl: "", 
  selSty: "", 
  selEnt: "",
  submit: "OK",
  event: eventName };

  var formData = querystring.stringify(formDetails);
  var contentLength = formData.length;

  return new Promise(function(resolve, reject) {
    request(
    {
      headers: {
        'Host': 'www.o2cm.com',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-us',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/x-www-form-urlencoded',
      },

      uri: URI,
      body: formData,
      method: 'POST'
    }, function (err, res, body) {
        var COMPETITION_PAGE = cheerio.load(body)
        resolve([COMPETITION_PAGE, competitionInfo])
    });
  })
}


function forEveryEventPage(COMPETITION_PAGE, competitionInfo) {

  // Extract the event info from the page
  var gen = eventLinkGenerator(COMPETITION_PAGE)
  while(true) {
    var next = gen.next()

    if(next.done == true){
      break
    }
    else {
      // Keep track of event info here
      var eventInfo = next.value

      var ref = eventInfo.ref

      // Load a single event into memory
      loadEventPage_Promise(ref, eventInfo)

      // Extract the selectors and continue onto the next step
      .then(function(tuple) {
        var EVENT_PAGE = tuple[0]
        var ref = tuple[1]
        var eventInfo = tuple[2]
        forEveryRound(EVENT_PAGE, ref, eventInfo, competitionInfo)
      })

    }
  }
}

function loadEventPage_Promise(ref, eventInfo) {

  var url = ROOT_URL + ref

  return new Promise(function(resolve, reject){

    // Perform the asynch request
    request(url, function(error, response, html){

      // Load the page
      var EVENT_PAGE = cheerio.load(html)
      // var EVENT_PAGE = cheerio.load(fs.readFileSync('event_page.html'))

      // Return the page and the url of the page
      resolve([EVENT_PAGE, ref, eventInfo])
      
    })

  })
}

function forEveryRound(EVENT_PAGE, ref, eventInfo, competitionInfo) {

  // Extract the selector info from the page
  var gen = roundSelectorGenerator(EVENT_PAGE)
  while(true) {
    var next = gen.next()

    if(next.done == true){
      break
    }
    else {
      // TODO keep track of info here
      var selectorId = next.value

      if(selectorId == NO_SELECTOR){
        // TODO
        continue;
      }

      // Load a single round into memory
      loadRoundPage_Promise(ref, selectorId)

      // Scape the round
      .then((val) => {scrapeRound(val, eventInfo, competitionInfo)})

    }
  }
}

function loadRoundPage_Promise(ref, selectorId) {

  var details = ref.split('?')
  var path = details[0]
  var URI = ROOT_URL + path

  var getParams = details[1].split('&')
  var EVENT_NAME = getParams[0].split('=')[1]
  var HEAD_ID = getParams[1].split('=')[1]

  var formDetails = { 
  heatid: HEAD_ID, 
  event: EVENT_NAME,
  selCount: selectorId
  };

  var formData = querystring.stringify(formDetails);
  var contentLength = formData.length;

  return new Promise(function(resolve, reject) {
    request(
    {
      headers: {
        'Host': 'www.o2cm.com',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-us',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/x-www-form-urlencoded',
      },

      uri: URI,
      body: formData,
      method: 'POST'
    }, function (err, res, body) {
        var ROUND_PAGE = cheerio.load(body)
        resolve(ROUND_PAGE)
    });
  })

}

function scrapeRound(ROUND_PAGE, eventInfo, competitionInfo) {

  // Parse the round
  var parsedRound = parser.parsePage(ROUND_PAGE)

  // If it returns an empty string, do nothing. Page not supported
  if(parsedRound == 'NOT_SUPPORTED') {
    return
  }

  // Else add the event info
  var output = new Info(parsedRound, eventInfo, competitionInfo)
  if(PRINT_RESULTS) console.log(JSON.stringify(output), null, '\t')
  
}


function *competitionLinkGenerator($) {

  var year = ''

  var competitionInfo = []

  var arr = $('table tr')
  // REDO Extract only the first competition (happens on line 4)
  for(var i = 0; i < arr.length; i++) {
    var element = arr[i]

    // Check if it is a year
    if($(element).find(COMPETITION_YEAR_SELECTOR).text() != '') {
      year = $(element).text().trim()
    }
    // Else it is competition info
    else {

      if(!($(element).text().trim().includes(COMP_SEARCH_STRING))){
        continue;
      }

      var ref  =  $(element).find('a').attr('href')
      ,   name =  $(element).find('a').text().trim()
      ,   date =  $(element).find(COMPETITION_DATE_SELECTOR).text().trim()

      // Ensure no gibberish
      if(!(name == '' || date == '' || year == '' || ref == 'undefined')){
        yield new CompetitionInfo(name, date, year, ref)
      }
    }

  }
}

function *eventLinkGenerator($) {
  var links = []

  var arr = $('.h5b')
  // REDO just getting the first 5 events
  for(var i = 0; i < arr.length; i++) {
    var element = arr[i]

    var ref   = $(element).find('a').attr('href')
    ,   text = $(element).find('a').text().trim()

    var americanOrInternational = isAmerican(text) ? "American" : isInternational(text) ? "International" : "Unknown AoI: "+text 
    var skill = parseSkill(text)
    var division = parseDivision(text)
    var age = parseAge(text)

    yield new EventInfo(division, age, americanOrInternational, skill, "style (check the dances)", ref)
  }
}

function parseAge(text) {

  var words = text.toLowerCase().replace(/\./g, '').split(' ')

  if(words.map(matchAdult).reduce((a, b) => {return a || b}))
    return "Adult"
  else
    return "Unknown age: " + text

  function matchAdult(word) {
    return ['adult'].includes(word)
  }
}

function parseDivision(text) {

  var words = text.toLowerCase().replace(/\./g, '').split(' ')

  if(words.map(matchAmateur).reduce((a, b) => {return a || b}))
    return "Amateur"
  else
    return "Unknown division: " + text

  function matchAmateur(word) {
    return ['amateur'].includes(word)
  }
}

function parseSkill(text) {

  var words = text.toLowerCase().replace(/\./g, '').split(' ')

  if(words.map(matchNewcomer).reduce((a, b) => {return a || b}))
    return "Newcomer"
  else if(words.map(matchBronze).reduce((a, b) => {return a || b}))
    return "Bronze"
  else if(words.map(matchSilver).reduce((a, b) => {return a || b}))
    return "Silver"
  else if(words.map(matchGold).reduce((a, b) => {return a || b}))
    return "Gold"
  else if(words.map(matchOpen).reduce((a, b) => {return a || b}))
    return "Open"
  else if(words.map(matchChamp).reduce((a, b) => {return a || b}))
    return "Champ"
  else if(words.map(matchSyllabus).reduce((a, b) => {return a || b}))
    return "Syllabus"
  else if(words.map(matchPreChamp).reduce((a, b) => {return a || b}))
    return "Pre-Champ"
  else
    return "Unknown skill: " + text



  function matchNewcomer(word) {
    return ['newcomer'].includes(word)
  }

  function matchBronze(word) {
    return ['bronze'].includes(word)
  }

  function matchSilver(word) {
    return ['silver'].includes(word)
  }

  function matchGold(word) {
    return ['gold'].includes(word)
  }

  function matchOpen(word) {
    return ['open'].includes(word)
  }

  function matchChamp(word) {
    return ['champ'].includes(word)
  }

  function matchSyllabus(word) {
    return ['syllabus'].includes(word)
  }

  function matchPreChamp(word) {
    return ['pre-champ', 'prechamp'].includes(word)
  }

}

function isInternational(text) {

  var words = text.toLowerCase().replace(/\./g, '').split(' ')
  return words.map(matchInternationalWords).reduce((a, b) => {return a || b}) 

  function matchInternationalWords(word) {

    var intlWords = [
      'intl',
      'inter',
      'standard',
      'stnd',
      'latin',
      ]

      return intlWords.includes(word)

  }

}

function isAmerican(text) {

  var words = text.toLowerCase().replace(/\./g, '').split(' ')
  return words.map(matchAmericanWords).reduce((a, b) => {return a || b}) 

  function matchAmericanWords(word) {

    var amerWords = [
      'am',
      'american',
      'rhythm',
      'amer',
      'smooth'
      ]

      return amerWords.includes(word)

  }

}

function *roundSelectorGenerator($) {

  var rounds = []

  var arr = $('SELECT OPTION')

  if(arr.length == 0) {
    yield NO_SELECTOR
    return;
  }

  for(var i = 0; i < arr.length; i++) {
    var element = arr[i]

    yield $(element).attr('value')
  }

}

class CompetitionInfo {
  constructor(name, date, year, ref) {
    this.name = name
    this.date = date
    this.year = year
    this.ref = ref
  }
}

class EventInfo {
  constructor(division, age, americanOrInternational, skill, style, ref) {
    this.division = division
    this.age = age
    this.skill = skill
    this.style = style
    this.ref = ref
    this.americanOrInternational = americanOrInternational
  }
}

class Info {
  constructor(roundInfo, eventInfo, competitionInfo) {
    this.roundInfo = roundInfo
    this.eventInfo = eventInfo
    this.competitionInfo = competitionInfo
  }
}