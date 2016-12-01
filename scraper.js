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


/* SCRIPT ENTRANCE */

scrape()

/* END SCRIPT */

function scrape() {

  // Scrape the main results webpage
  loadMainPage_Promise(ROOT_URL)
  .then(forEveryCompetitionPage)
}

function loadPage_Promise(url) {
  return new Promise(function(resolve, reject){

    // Perform the asynch request
    request(url, function(error, response, html){

      // Load the page
      // var $ = cheerio.load(html)
      var ROOT_PAGE = cheerio.load(fs.readFileSync('competitions_page.html'))

      // TODO
      // Assuming that all the requests finished with no errors
      // Should check for this somehow

      // Return the page
      resolve(ROOT_PAGE)
      
    })
  })
}

function loadMainPage_Promise(url) {
  return new Promise(function(resolve, reject){

    // Perform the asynch request
    request(url, function(error, response, html){

      // Load the page
      // var $ = cheerio.load(html)
      var ROOT_PAGE = cheerio.load(fs.readFileSync('competitions_page.html'))

      // Return the page
      resolve(ROOT_PAGE)
      
    })
  })
}

function forEveryCompetitionPage(ROOT_PAGE) {
  // Extract the competition info from the page
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

      loadCompetitionPage_Promise(ROOT_URL, ref)
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
        console.log(body)
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

      var url = ROOT_URL + eventInfo.ref

      loadEventPage_Promise(url)
      .then(function() {})

      // console.log(eventInfo)
    }
  }
}


function *competitionLinkGenerator($) {

  var year = ''

  var competitionInfo = []

  var arr = $('table tr')
  // TODO change back
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
  for(var i = 0; i < arr.length; i++) {
    var element = arr[i]

    var ref       = $(element).find('a').attr('href')
    ,   skill  = $(element).find('a').text().trim()

    yield new EventInfo("Amateur", "Adult", skill, "PARSE THIS", ref)
  }
}

function loadEventPage_Promise(url) {
  return new Promise(function(resolve, reject){
    // Perform the asynch request
    request(url, function(error, response, html){

      // TODO PRESS THE SUBMIT BUTTON SOMEHOW

      // Load the page
      // var $ = cheerio.load(html)
      // COMPETITION_PAGE = cheerio.load(fs.readFileSync('tufts_page.html'))
      // var COMPETITION_PAGE = cheerio.load(fs.readFileSync('tufts_page_submitted.html'))

      // TODO
      // Assuming that all the requests finished with no errors
      // Should check for this somehow

      // Return the page
      // resolve(COMPETITION_PAGE)
      resolve(0)
      
    })

  })
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