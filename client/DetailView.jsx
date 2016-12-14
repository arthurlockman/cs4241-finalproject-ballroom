import React from 'react';
import ReactDOM from 'react-dom';
import {VictoryChart, VictoryBar, VictoryAxis, VictoryPie} from 'victory';
import axios from 'axios';
import {Grid, Row, Column} from 'react-cellblock';
import Banner from './cellblock/modules/Banner.js';
import Nav from './cellblock/modules/Nav.js';
import Optimized from './cellblock/modules/Optimized.js';
import Blocker from './cellblock/modules/Blocker.js';
import {createHTMLTable} from './js/table.js';
import ChartsController from './Charts/ChartsController.jsx';

class DetailView extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.initialState = {
            postDetail: '',
            resultsJSON: []
        };
    }
    componentDidMount() {
        this.getResults();
        console.log(this.props.postDetail);
        if (this.props.postDetail) {
            this.setState({postDetail: this.props.postDetail});
            console.log("this.state.postDetail", this.state.postDetail);
        }
    }

    getResults() {
        axios.get('http://cs4241-fp-arthurlockman.herokuapp.com/api/competition/2016/worcester/semi-final/Bronze').then(res => {
            // console.log(res);
            // const posts = res.data.dances.map(obj => obj.danceName);
            // console.log("posts", posts);
            this.setState({resultsJSON: res.data});
        });
    }

    componentWillUpdate(nextProps) {}

    buildBarChart() {
        return (
            <VictoryChart domainPadding={{
                x: 40
            }}>
                <VictoryBar data={[
                    {
                        experiment: "trial 1",
                        expected: 3.75,
                        actual: 3.21
                    }, {
                        experiment: "trial 2",
                        expected: 3.75,
                        actual: 3.38
                    }, {
                        experiment: "trial 3",
                        expected: 3.75,
                        actual: 2.05
                    }, {
                        experiment: "trial 4",
                        expected: 3.75,
                        actual: 3.71
                    }
                ]} x="experiment" y={(d) => (d.actual / d.expected) * 100}/>
                <VictoryAxis label="experiment" style={{
                    axisLabel: {
                        padding: 30
                    }
                }}/>
                <VictoryAxis dependentAxis label="percent yield" style={{
                    axisLabel: {
                        padding: 40
                    }
                }}/>
            </VictoryChart>
        )
    }

    buildPiChart() {
        return (< VictoryPie data = {
            [
                {
                    month: this.state.postDetail.title,
                    profit: this.state.postDetail.ups,
                    loss: this.state.postDetail.downs
                }, {
                    month: "October",
                    profit: this.state.postDetail.ups,
                    loss: this.state.postDetail.downs
                }, {
                    month: "November",
                    profit: this.state.postDetail.ups,
                    loss: this.state.postDetail.downs
                }
            ]
        }
        x = "month" y = {
            (datum) => datum.profit - datum.loss
        } />)
    }

    createMarkup() {
        return {
            __html: createHTMLTable(this.state.resultsJSON)
        };
    }

    render() {
        return (
            <Grid>
                <Banner className="header">{this.state.postDetail.name}
                    <br/>
                    <button className="btn btn-default fa fa-search" onClick={this.props.handleClickBack}></button>
                </Banner>
                <Row>
                    <Column width="1">
                        <div dangerouslySetInnerHTML={this.createMarkup()}/>;
                    </Column>
                    <Column width="1">
                        <ChartsController/> {/* <p>Testing some Text...</p> */}
                    </Column>
                </Row>
                <Banner className="footer">{this.state.postDetail.type}</Banner>
            </Grid>

        );
    }
}

export default DetailView;

// ReactDOM.render(
// <FetchDemo subreddit="reactjs"/>,
//   document.getElementById('root')
// );
