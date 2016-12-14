var json = require('./merp.json');
var numDances = json.dances.length
var competitionName= json.competitionName
var competitionDate = json.competitionDate
var roundName = json.roundName


main()

function main() {
	console.log(createHTML())
	// createHTML()
}


function createHTML() {

	html = `
		<html>
			<head>
				<meta charset="utf-8">
    			<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
	
				<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.5/css/bootstrap.min.css" integrity="sha384-AysaV+vQoT3kOAXZkl02PThvDr8HYKPZhNT5h/CXfBThSRXQ6jW5DO2ekP5ViFdi" crossorigin="anonymous">

				<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js" integrity="sha384-3ceskX3iaEnIogmQchP8opvBy3Mi7Ce34nWjpBIwVTHfGYWQS9jwHDVRnpKKHJg7" crossorigin="anonymous"></script>
				<script src="https://cdnjs.cloudflare.com/ajax/libs/tether/1.3.7/js/tether.min.js" integrity="sha384-XTs3FgkjiBgo8qjEjBk0tGmf3wPrWtA6coPfQDfFEY8AnYJwjalXCiosYRBIBZX8" crossorigin="anonymous"></script>
				<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.5/js/bootstrap.min.js" integrity="sha384-BLiI7JTZm+JWlgKa0M0kGRpJbF2J8q+qreVrKBC47e3K6BW78kGLrCkeRX6I9RoK" crossorigin="anonymous"></script>
			</head>

			<body>
			<h1 style="text-align: center;">
				${roundName}
			</h1>
			<br>
				${createTables()}
			</body>
		</html>
	`

	return html


}

function createTables() {

	var html = ''

	for(var i = 0; i < numDances; i++) {
		html += createTable(json.dances[i])
	}

	return html
}

function createTable(dance) {

	var rowSpan = Math.floor(12 / numDances);
	var danceName = dance.danceName

	var html = `

	<div class="col-md-${rowSpan}">
		<h2 class="sub-header">${danceName}</h2>
		<div class="table-responsive">
			<table class="table table-hover table-striped">
				<thead class="thead-inverse">
					<tr>
						${createTableHeader(dance)}
					</tr>
				</thead>
				<tbody>
						${createRows(dance)}
				</tbody>
			</table>
		</div>
	</div>


	`
	return html
}

function createTableHeader(dance) {
	var html = `<tr><th></th>`
	var judges = []
	for(judge in dance.competitors[0].marks) {
		judges.push(judge)
	}

	for(var i = 0; i < judges.length; i++) {
		html += `<th style="text-align: center;">${judges[i]}</th>`
	}

	html += `<th style="text-align: center;">Total Marks</th>`
	html += `<th style="text-align: center;">Advanced to Next Round</th>`

	html += `</tr>`
	return html

}

function createRows(dance) {

	var totalMarkArray = []

	// Organize by marks/advancement
	for(var i = 0; i < dance.competitors.length; i++) {
		totalMarkArray.push([i, dance.competitors[i].totalMarks])
	}

	totalMarkArray.sort(function(a, b) {
		if(a[1] > b[1]) {
			return -1
		}
		else if(a[1] == b[1]) {
			return 0
		}
		else {
			return 1
		}
	})

	var html = ''

	for(var i = 0; i < totalMarkArray.length; i++) {
		html += createRow(dance.competitors[totalMarkArray[i][0]])
	}

	return html

}

function createRow(coupleInfo) {

	var name_1 = coupleInfo.name_1
	var name_2 = coupleInfo.name_2
	var coupleNum = coupleInfo.coupleNumber
	var totalMarks = coupleInfo.totalMarks
	var advanced = coupleInfo.advanced
	var marks = coupleInfo.marks

	var html = `
		<tr>
	      <th scope="row">${name_1} & ${name_2} </th>
	`
	for(mark in marks) {
		html += `<td style="text-align: center;">${marks[mark] ? 'X' : ''}</td>`
	}

	html += `<td style="text-align: center;">${totalMarks}</td>`
	html += `<td style="text-align: center;">${advanced ? 'X' : ''}</td>`

	html += `</tr>`

	return html

}