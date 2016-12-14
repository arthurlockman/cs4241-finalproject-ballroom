import React from 'react';
import ReactDOM from 'react-dom';
// import Charts from './Charts/Charts.js';

const COLORS = [
    '#43A19E',
    '#7B43A1',
    '#F2317A',
    '#FF9824',
    '#58CF6C',
    '#000000'
]
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function compareNumbers(a, b) {
    return a - b;
}

class ChartsController extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.initialState = {
            data: [],
            series: [
                'Am. Waltz', 'Am. Tango'
            ],
            labels: [
                '0 marks', '1 mark', '2 marks', '3 marks', '4 marks'
            ],
            colors: ['#43A19E', '#7B43A1', '#F2317A', '#FF9824', '#58CF6C']
        };
    }

    componentDidMount() {
        this.populateArray();
    }
    populateArray() {
        var data = [],
            series = 2, // Number of charts
            serieLength = 5;

        for (var i = series; i--;) {
            var tmp = [];

            for (var j = serieLength; j--;) {
                tmp.push(getRandomInt(0, 20));
            }

            data.push(tmp);
        }

        this.setState({data: data});
    }
    
    render() {
        return (
            <section>
                {/* <Charts data={this.state.data} labels={this.state.series} colors={this.state.colors} barLabels={this.state.labels} height={500}/> */}
            </section>
        );
    }
}

export default ChartsController;
