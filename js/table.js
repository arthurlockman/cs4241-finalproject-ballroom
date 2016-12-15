// var json = require('./example.json');

export function createHTMLTable(json) {

    try {
        var numDances = json.dances.length
        var competitionName = json.competitionName
        var competitionDate = json.competitionDate
        var roundName = json.roundName

        var html = `

			<div>
			<h1 style="text-align: center;">
				${roundName}
			</h1>
			<br>
				${createTables(numDances, json)}
			</div>

	`

        return html
    } catch (err) {
        console.log(err);
    }

}

function createTables(numDances, json) {

    var html = ''

    for (var i = 0; i < numDances; i++) {
        html += createTable(json.dances[i], numDances)
    }

    return html
}

function createTable(dance, numDances) {

    var rowSpan = Math.floor(12 / numDances);
    var danceName = dance.danceName

    var html = `

	<div class="col-md-12">
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
    judges = Object.keys(dance.competitors[0].marks)

    for (var i = 0; i < judges.length; i++) {
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
    for (var i = 0; i < dance.competitors.length; i++) {
        totalMarkArray.push([i, dance.competitors[i].totalMarks])
    }

    totalMarkArray.sort(function(a, b) {
        if (a[1] > b[1]) {
            return -1
        } else if (a[1] == b[1]) {
            return 0
        } else {
            return 1
        }
    })

    var html = ''

    for (var i = 0; i < totalMarkArray.length; i++) {
        html += createRow(dance.competitors[totalMarkArray[i][0]], i)
    }

    return html

}

function createRow(coupleInfo, index) {

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
    var markKeys = Object.keys(marks)
    for (var i = 0; i < markKeys.length; i++) {
        html += `<td style="text-align: center;">${marks[markKeys[i]]
            ? 'X'
            : ''}</td>`
    }

    html += `<td style="text-align: center;">${totalMarks}</td>`
    html += `<td style="text-align: center;">${advanced
        ? 'X'
        : ''}</td>`

    html += `</tr>`

    return html

}
