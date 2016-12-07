var express = require('express')
var fs      = require('fs')
var request = require('request')
var cheerio = require('cheerio')
var cheerioTableparser = require('cheerio-tableparser')
var querystring = require('querystring')


module.exports = {
  scrape
}

/* GLOBALS */
const COMPETITION_YEAR_SELECTOR = '.h3'
,     COMPETITION_DATE_SELECTOR = 'td:nth-child(3)'

ROOT_URL = 'http://www.o2cm.com/results/'
LOG = false
NO_SELECTOR = -9999;


/* SCRIPT ENTRANCE */
var d = new Date();
var startTime = d.getTime();

scrape()

d = new Date();
var endTime = d.getTime();

console.log("Total time: " + (endTime - startTime))

/* END SCRIPT */

function scrape() {

  // Load the main page
  loadMainPage_Promise(ROOT_URL)

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
      loadCompetitionPage_Promise(ROOT_URL, ref)

      // Extract the event URLs and perform next step
      .then(forEveryEventPage)
    }
  }
}

// ROOT_URL: http://www.o2cm.com/results/
// ref = event3.asp?event=sib16
function loadCompetitionPage_Promise(ROOT_URL, ref) {

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
        resolve(COMPETITION_PAGE)
    });
  })
}


function forEveryEventPage(COMPETITION_PAGE) {

  // Extract the event info from the page
  var gen = eventLinkGenerator(COMPETITION_PAGE)
  while(true) {
    var next = gen.next()

    if(next.done == true){
      break
    }
    else {
      // TODO keep track of info here
      var eventInfo = next.value

      var ref = eventInfo.ref

      // Load a single event into memory
      loadEventPage_Promise(ref)

      // Extract the selectors and continue onto the next step
      .then(function(tuple) {
        var EVENT_PAGE = tuple[0]
        var ref = tuple[1]
        forEveryRound(EVENT_PAGE, ref)
      })

    }
  }
}

function loadEventPage_Promise(ref) {

  var url = ROOT_URL + ref

  return new Promise(function(resolve, reject){

    // Perform the asynch request
    request(url, function(error, response, html){

      // Load the page
      var EVENT_PAGE = cheerio.load(html)
      // var EVENT_PAGE = cheerio.load(fs.readFileSync('event_page.html'))

      // Return the page and the url of the page
      var tuple = [EVENT_PAGE, ref]
      resolve(tuple)
      
    })

  })
}

function forEveryRound(EVENT_PAGE, ref) {

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
      .then(function(ROUND_PAGE){
        // DO SOMETHING HERE
        console.log(ROUND_PAGE.html())
      })
      // .then(scrapeRound)

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

function scrapeRound(ROUND_PAGE) {

}


function *competitionLinkGenerator($) {

  var year = ''

  var competitionInfo = []

  var arr = $('table tr')
  // TODO Extract only the first competition (happens on line 4)
  for(var i = 0; i < 4 /*arr.length*/; i++) {
    var element = arr[i]

    // Check if it is a year
    if($(element).find(COMPETITION_YEAR_SELECTOR).text() != '') {
      year = $(element).text().trim()
    }
    // Else it is competition info
    else {

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
  // TODO just getting the first 5 events
  for(var i = 0; i < 5 /*arr.length*/; i++) {
    var element = arr[i]

    var ref   = $(element).find('a').attr('href')
    ,   skill = $(element).find('a').text().trim()

    yield new EventInfo("Amateur", "Adult", skill, "PARSE THIS", ref)
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
  constructor(division, age, skill, style, ref) {
    this.division = division
    this.age = age
    this.skill = skill
    this.style = style
    this.ref = ref
  }
}