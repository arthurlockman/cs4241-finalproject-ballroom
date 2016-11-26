var express = require('express');
var fs      = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();
var cheerioTableparser = require('cheerio-tableparser');

module.exports = {
  scrape
};

const COMPETITION_YEAR_SELECTOR = '.h3'
,     COMPETITION_DATE_SELECTOR = 'td:nth-child(3)'

scrape()

function scrape() {

  url = 'http://www.o2cm.com/results/'
  var competitionInfo;

  // Scrape the main results webpage
  new Promise(function(fulfill, reject){

    // Perform the asynch request
    request(url, function(error, response, html){
      // Load the page
      var $ = cheerio.load(html);

      // Extract the competition info from the page
      competitionInfo = extractAllCompetitionInfo($);

      // When the request is done, execute the next step
      fulfill();
    })
  })

  // Scrape the webpage of every competition
  .then(function() {
    // Create an array of promises; one promise for every competition
    var promiseArray = composePromiseArray(url, competitionInfo);

    // Scrape all the competitions
    return Promise.all(promiseArray);
  })

  .then(function() {
    console.log('All webpages scraped.')
  })

}

function composePromiseArray(url, competitionInfo) { 

  var promiseArray = []

  // TODO competitionInfo.length
  for(var i = 0; i < 1; i++) {
    // Compose the url of a single competition
    competitionURL = url + competitionInfo[i].ref;

    // Create a promise to scrape this webpage
    var prom = new Promise(function(resolve, reject) {

      // Perform the asynch request
      request(competitionURL, function(error, response, html){
        // Load the page
        var $ = cheerio.load(html);

        extractSingleCompetitionInfo($);

        resolve();

      });
    });

    promiseArray.push(prom)
  }

  return promiseArray;
}

function extractSingleCompetitionInfo($) {

  var competitors = []

  $('#selEnt').each(function(i, element) {

    var names = $(element).text().replace(/, /g, '#').split(/\s+/)

    for(var i = 0; i < names.length; i++) {
      var name = names[i];
      var fullName = name.split('#');

      if(fullName.length != 2) {
        continue;
      }

      competitors.push(new Competitor(fullName[1], fullName[0]))
    }

  })

  return competitors;
}

// Extracts all competition info from the main results page:
// http://www.o2cm.com/results/
// Puts the info into a list of objects containing the competition name, date, year, and href
function extractAllCompetitionInfo($) {

  var year = '';

  var competitionInfo = []

  $('table tr').each(function(i, element){

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
        competitionInfo.push(new CompetitionInfo(name, date, year, ref))
      }
    }
  })

  return competitionInfo
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