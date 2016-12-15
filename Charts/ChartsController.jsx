import React from 'react';
import ReactDOM from 'react-dom';
import Charts from './Charts.jsx';

const COLORS = [
    '#43A19E',
    '#7B43A1',
    '#F2317A',
    '#FF9824',
    '#58CF6C',
    '#000000',
    ''
]
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}


class ChartsController extends React.Component {
    constructor(props) {
        super(props);
        // console.log(props.data)

        var numJudges = Object.keys(props.data.competitors[0].marks).length+1
        var lbl = []
        for(var i = 0; i < numJudges; i++) {
            lbl.push(i+" marks")
        }

        var totalMarksArray = props.data.competitors.map(function(competitor) {
            return competitor.totalMarks
        })

        totalMarksArray.sort()

        var markFrequencyDict = {};

        // All mark frequecy start at 0
        for(var i = 0; i < numJudges; i++) {
            markFrequencyDict[i] = 0
        }

        // For every markTotal, increment the dictionary value
        for(var i = 0; i< totalMarksArray.length; i++) {
            var num = totalMarksArray[i];
            markFrequencyDict[num] = markFrequencyDict[num]+1
        }

        var markFrequencyArr = []
        for(var i = 0; i < numJudges; i++) {
            markFrequencyArr.push(markFrequencyDict[i])
        }

        console.log(markFrequencyArr)

        this.state = this.initialState = {
            data: [markFrequencyArr],
            series: [
                props.data.danceName
            ],
            labels: lbl,
            colors: COLORS
        };
    }

    componentDidMount() {
        // this.populateArray();
    }

    // populateArray() {
    //     var data = [],
    //         series = 1, // Number of charts
    //         serieLength = 5;

    //     for (var i = series; i--;) {
    //         var tmp = [];

    //         for (var j = serieLength; j--;) {
    //             tmp.push(getRandomInt(0, 20));
    //         }

    //         data.push(tmp);
    //     }

    //     this.setState({data: data});
    // }
    
    render() {
        return (
            <section>
                <Charts data={this.state.data} labels={this.state.series} colors={this.state.colors} barLabels={this.state.labels} height={500}/>
            </section>
        );
    }
}

export default ChartsController;
