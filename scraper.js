var express = require('express');
var fs      = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();
var cheerioTableparser = require('cheerio-tableparser');

module.exports = {
  scrape
};

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
  loadMainPage_Promise()
  .then(forEveryCompetitionPage)
}

function loadMainPage_Promise() {
  return new Promise(function(resolve, reject){

    // Perform the asynch request
    request(ROOT_URL, function(error, response, html){

      // Load the page
      // var $ = cheerio.load(html);
      var ROOT_PAGE = cheerio.load(fs.readFileSync('competitions_page.html'));

      // TODO
      // Assuming that all the requests finished with no errors
      // Should check for this somehow

      // Return the page
      resolve(ROOT_PAGE)
      
    })
  })
}

function forEveryCompetitionPage(ROOT_PAGE) {
  // Extract the competition info from the page
  var gen = competitionLinkGenerator(ROOT_PAGE);
  while(true) {
    var next = gen.next();

    if(next.done == true){
      break;
    }
    else {
      // TODO keep track of info here
      var info = next.value

      // Load the competition page
      var url = ROOT_URL + info.ref;

      loadCompetitionPage_Promise(url)
      .then(forEveryEventPage)
    }
  }
}

function loadCompetitionPage_Promise(url) {
  return new Promise(function(resolve, reject){
    // Perform the asynch request
    request(url, function(error, response, html){

      // TODO PRESS THE SUBMIT BUTTON SOMEHOW

      // Load the page
      // var $ = cheerio.load(html);
      // COMPETITION_PAGE = cheerio.load(fs.readFileSync('tufts_page.html'));
      var COMPETITION_PAGE = cheerio.load(fs.readFileSync('tufts_page_submitted.html'));

      // TODO
      // Assuming that all the requests finished with no errors
      // Should check for this somehow

      // Return the page
      resolve(COMPETITION_PAGE)
      
    })

  })
}

function forEveryEventPage(COMPETITION_PAGE) {

  // Extract the event info from the page
  var gen = eventLinkGenerator(COMPETITION_PAGE);
  while(true) {
    var next = gen.next();

    if(next.done == true){
      break;
    }
    else {
      // TODO keep track of info here
      console.log(next.value)

    }
  }
}


function *competitionLinkGenerator($) {

  var year = '';

  var competitionInfo = []

  var arr = $('table tr')
  for(var i = 0; i < arr.length; i++) {
    var element = arr[i];

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
        var info = new CompetitionInfo(name, date, year, ref);
        yield info
      }
    }

  }
}

function *eventLinkGenerator($) {
  var links = []

  var arr = $('.h5b')
  for(var i = 0; i < arr.length; i++) {
    var element = arr[i];

    console.log($(element).find('a').text().trim())
  }
}

class Competitor {
  constructor(firstName, lastName) {
    this.firstName = firstName;
    this.lastName = lastName;
  }
}

class CompetitionInfo {
  constructor(name, date, year, ref) {
    this.name = name;
    this.date = date;
    this.year = year;
    this.ref = ref;
  }

  toString() {
    return name + " " + date + ", " + year;
  }
}