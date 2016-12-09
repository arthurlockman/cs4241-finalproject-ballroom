var express = require('express')
var fs      = require('fs')
var request = require('request')
var cheerio = require('cheerio')
var cheerioTableparser = require('cheerio-tableparser')
var querystring = require('querystring')

module.exports = {
  parsePage
}

// parseURL('').then(function(val) {
// 	console.log(JSON.stringify(val))
// })

function parseURL(url) {
	return loadMainPage_Promise(url).then(parsePage)
}

// Load the main page into memory
function loadMainPage_Promise(url) {
  return new Promise(function(resolve, reject){

    // Perform the asynch request
    request(url, function(error, response, html){

      // Load the page
      // var PAGE = cheerio.load(html)
      // var PAGE = cheerio.load(fs.readFileSync('debug.html'))
      var PAGE = cheerio.load(fs.readFileSync('debug2.html'))
      // var PAGE = cheerio.load(fs.readFileSync('quarterFinal.html'))

      // Return the page
      resolve(PAGE)
      
    })
  })
}

function parsePage($) {

	var roundName = parseRoundName($)

	if(roundName == 'Final') {
		return 'NOT_SUPPORTED'
	}

	if(isFinalRound($)) {
		return 'NOT_SUPPORTED'
	}

	var couplesAndJudges = parseCouplesAndJudges($)
	var couples = couplesAndJudges[0]
	var judges = couplesAndJudges[1]

	var allDanceInfo  = parseMarks($)

	// Create dictionary of judgeNum -> judgeName
	var judgeDict = {}
	for(var i = 0; i < judges.length; i++) {
		judgeDict[judges[i].number] = judges[i].name
	}

	var coupleRoundData = []

	// For every couple competing in a round
	for(var i = 0; i < couples.length; i++) {

		// Extract couple info
		var couple = couples[i]
		var name_1 = couple.name_1
		var name_2 = couple.name_2
		var coupleNum = couple.number

		var advance = false
		var dances = []

		// For every dance in the round
		for(var p = 0; p < allDanceInfo.length; p++) {

			var total = -1
			var marks = {}

			var danceInfo = allDanceInfo[p]
			var danceName = danceInfo.danceName
			var judgeNums = danceInfo.judgeNums
			var markData = danceInfo.markData

			// For markInfo in the dance
			for(var q = 0; q < markData.length; q++) {

				var markDatum = markData[q]

				// If the marks are for the specificed couple
				if(markDatum.coupleNum == coupleNum) {
					total = markDatum.total
					advance = advance || markDatum.advance
					
					for(var r = 0; r < markDatum.marks.length; r++) {
						var mark = markDatum.marks[r]
							marks[judges[r].name] = mark
					}

					break;
				}
			}

			dances.push(new CoupleDanceInfo(danceName, marks, total))

		}

		coupleRoundData.push(new CoupleRoundDatum(name_1, name_2, coupleNum, roundName, dances, advance))
	}
	// console.log(JSON.stringify(coupleRoundData))
	return coupleRoundData
}

function isFinalRound($) {

	// If there is only one round, it is a finals round. There is no selector
	return ($('select').length == 0)
}

function parseRoundName($) {
	var roundName = 'UNKNOWN'
	$('option').each(function(i, el) {
		if($(this).attr("selected") == 'selected') {
			roundName = $(this).text().trim()
			return true
		}
	})

	return roundName
}

function parseCouplesAndJudges($) {

	var couples = []
	var judges = []

	// Parsing couples or judges
	var isCouples 	= false
	var isJudges 	= false

	// For every row in the table
	$('body .t1n').last().find('tr').each(function(i, elt) {

		// Parse the text and remove the weird whitespace
		var line = $(elt).text().replace(/[^\S ]+/g, ' ')

		// Split it on the hypen. Not tracking location
		var info = line.split('-')

		var nameInfo = info[0].trim()

		// Is parsing couples or judges?
		if(nameInfo == 'Couples') {
			isCouples = true;
			isJudges = false;
			return true;
		} 	
		else if(nameInfo == 'Judges') {
			isJudges = true;
			isCouples = false;
			return true;
		}

		// If it is an empty string, continue the loop
		if(nameInfo == '') {
			return;
		}

		// If parsing couples
		if(isCouples == true) {
			
			// Assuming the competitor number will always be of length 3
			var number = nameInfo.slice(0, 3)

			// Remove comma and whitespace bewteen competitors
			var names = nameInfo.slice(3).trim().split(/\s*,\s/g)

			couples.push(new Couple(names[0], names[1], number))

		}

		// If parsing judges
		else if(isJudges == true) {
			
			// Assuming the number will always be of length 2
			var number = nameInfo.slice(0,2)

			var name = nameInfo.slice(2).trim()

			judges.push(new Judge(name, number))
		} 

		// Else idk what i'm parsing
		else {
			console.log("Idk what i'm parsing.")
		}
		
	})

	return [couples, judges]
}

function parseMarks($) {

	var dances = []

	$('body .t1n').each(function(index, tb){

		// The last table is couples/judges
		if(index == $('body .t1n').length - 1) {
			return false;
		}

		var danceName;
		var judgeNumbers = []
		var markData = []

		// For coupled dance in this round
		$(tb).find('tr').each(function(i, row) {

			// Parse the text and remove the weird whitespace
			var line = $(row).text().replace(/[^\S ]+/g, ' ').trim()

			// Assume that the first line is the name of the dance
			if(i == 0) {
				danceName = line
				return true;
			}

			// Assume that the second line are the judges numbers
			if(i == 1) {

				// Assume that judge numbers are always of length two
				// Remove weird whitepsace and split every second number
				judgeNumbers = line.replace(/\s/g, '').match(/.{1,2}/g)

				return true;
			}

			// Parsing the lines to remove whitespace and make consistent
			// Result: 138XOXXX4R
			// X indicated a mark, O indicates no mark
			line = $(row).text().replace(/\t/g, '-')
			line = line.replace(/\r\n/g, '')
			line = line.replace(/\s/g, 'O')
			line = line.replace(/-/g, '')
			
			// Assuming that numbers will always be of length 3
			var number = line.slice(0,3)

			// Number of marks equal to number of judges
			var marks = line.slice(3,3+judgeNumbers.length).split('').map((el) => {return el == 'X'})

			// Sum up the number of marks
			var total = marks.map((el) => {return el == true ? 1:0}).reduce((a,b) => {return a+b})

			// An R at the end indicates advancement
			var advance = line.includes('R')

			markData.push(new MarkDatum(number, marks, total, advance))
		})

		dances.push(new AllDanceInfo(danceName, judgeNumbers, markData))

	})

	return dances
}


class Couple {
	constructor(name_1, name_2, number) {
		this.name_1 = name_1
		this.name_2 = name_2
		this.number = number
	}
}

class Judge {
	constructor(name, number) {
		this.name = name
		this.number = number
	}
}

class MarkDatum {
	constructor(coupleNum, marks, total, advance) {
		this.coupleNum = coupleNum
		this.marks = marks
		this.total = total
		this.advance = advance
	}
}

class CoupleRoundDatum {
	constructor(name_1, name_2, coupleNumber, roundName, dances, advance) {
		this.name_1 = name_1
		this.name_2 = name_2
		this.coupleNumber = coupleNumber
		this.dances = dances
		this.advance = advance
		this.roundName = roundName
	}
}

class AllDanceInfo {
	constructor(danceName, judgeNums, markData) {
		this.danceName = danceName
		this.judgeNums = judgeNums
		this.markData = markData
	}
}

class CoupleDanceInfo {
	constructor(danceName, judgeMarkData, totalMarks) {
		this.danceName = danceName
		this.judgeMarkData = judgeMarkData
		this.totalMarks = totalMarks
	}

}