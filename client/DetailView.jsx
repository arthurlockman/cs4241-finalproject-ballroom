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
var Select = require('react-select');

const baseURL = "http://cs4241-fp-arthurlockman.herokuapp.com"

class DetailView extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.initialState = {
            postDetail: '',
            resultsJSON: [],
            isCompetition: false,
            skillSelect: '',
            roundSelect: '',
            currentURL: '',
            resultsJSONTable: []
        };
        this.onSelectCompetitions = this.onSelectCompetitions.bind(this);
        this.competitionsList = this.competitionsList.bind(this);
        this.renderCompetition = this.renderCompetition.bind(this);
        this.handleClickEnter = this.handleClickEnter.bind(this);
    }
    componentDidMount() {
        if (this.props.postDetail) {
            this.setState({postDetail: this.props.postDetail});
            this.getResults();
        }
    }

    getResults() {
        this.setState({currentURL: this.props.postDetail.link});
        axios.get('http://cs4241-fp-arthurlockman.herokuapp.com' + this.props.postDetail.link).then(res => {
            // const posts = res.data.dances.map(obj => obj.danceName);
            this.setState({resultsJSON: res.data});
        });
    }

    refreshResults(url) {
        this.setState({currentURL: url});
        axios.get('http://cs4241-fp-arthurlockman.herokuapp.com' + url).then(res => {
            // const posts = res.data.dances.map(obj => obj.danceName);
            this.setState({resultsJSON: res.data});
            this.setState({isCompetition: true});
            // this.setState({postDetail: this.props.postDetail});
        });
    }

    componentWillUpdate(nextProps) {}

    createMarkup() {
        return {
            __html: createHTMLTable(this.state.resultsJSONTable)
        };
    }

    competitorsList(props) {
        const numbers = props.competitors;
        const listItems = numbers.map((number) => <li>{number}</li>);
        return (
            <ul className="sideUL">{listItems}</ul>
        );
    }

    judgesList(props) {
        const numbers = props.judges;
        const listItems = numbers.map((number) => <li>{number}</li>);
        return (
            <ul className="sideUL">{listItems}</ul>
        );
    }

    handleClickEnter() {
        axios.get('http://cs4241-fp-arthurlockman.herokuapp.com' + this.state.currentURL + '/' + this.state.roundSelect + '/' + this.state.skillSelect).then(res => {
            console.log('handleClickEnter', res.data);
            // const posts = res.data.dances.map(obj => obj.danceName);
            // this.setState({resultsJSON: res.data});
            // this.setState({isCompetition: true});
            // this.setState({postDetail: this.props.postDetail});
            this.setState({resultsJSONTable: res.data});
        });
    }

    renderCompetition() {

        var that = this;
        const rounds = this.state.resultsJSON.rounds;
        var roundsList = rounds.map(function(str) {
            return {value: str, label: str}
        });

        var skillsList = this.state.resultsJSON.skills.map(function(str) {
            return {value: str, label: str}
        });

        function logChangeSkill(val) {
            console.log("Selected: " + val.value);
            that.setState({skillSelect: val.value});
        }
        function logChangeRound(val) {
            console.log("Selected: " + val.value);
            that.setState({roundSelect: val.value});
        }

        return (
            <div>
                <Row>
                    <Column width="1">
                        <p>{console.log(this.state.resultsJSON)}</p>
                        <h2>Competition Name</h2>
                        <p>{this.state.resultsJSON.competitionName}</p>
                        <h2>Competition Date</h2>
                        <p>{this.state.resultsJSON.competitionDate}</p>
                        <span></span>

                        <h2>Select Skills</h2>
                        <Select name="form-field-name" value={this.state.skillSelect} options={skillsList} onChange={logChangeSkill}/>
                        <h2>Select Round</h2>
                        <Select name="form-field-name" value={this.state.roundSelect} options={roundsList} onChange={logChangeRound}/>
                        <button className="btn btn-default fa fa-enter" onClick={this.handleClickEnter}>Enter</button>
                    </Column>
                </Row>
                <Row>
                    <Column width="1">
                        <div dangerouslySetInnerHTML={this.createMarkup()}/>;
                    </Column>
                </Row>
                <Row>
                    <Column width="1/2">
                        <h2>Competitors</h2>
                        {this.competitorsList(this.state.resultsJSON)}
                        {/* <ChartsController/> */}
                    </Column>
                    <Column width="1/2">
                        <h2>Judges</h2>
                        {this.judgesList(this.state.resultsJSON)}
                        {/* <ChartsController/> */}
                    </Column>
                </Row>
            </div>
        );
    }

    onSelectCompetitions(a, b, c) {
        //a.preventDefault();
        b.preventDefault();
        c.preventDefault();
        //console.log("onSelectCompetitions", a, b, c);
        this.refreshResults(a.link)
        return false
    }

    competitionsList(props) {
        try {
            var onClick = this.onSelectCompetitions;
            const competitions = props.competitions;
            const listItems = competitions.map((number) => <li>
                <a onClick={onClick.bind(this, number)} href={baseURL + number.link} target='_blank'>{number.competition}
                </a>
            </li>);
            return (
                <ul className="sideUL">{listItems}</ul>
            );
        } catch (err) {}
    }

    renderCompetitor() {
        return (
            <div>
                <Column width="1/1">
                    <h2>Competitor Name</h2>
                    <p>{this.state.resultsJSON.name}</p>
                    <h2>Competitions</h2>
                    {this.competitionsList(this.state.resultsJSON)}
                </Column>
                <Column width="1/1"></Column>
            </div>
        );
    }

    render() {
        if (this.state.postDetail.type === 'competition' || this.state.isCompetition) {
            return (
                <Grid>
                    <Banner className="header">{this.state.postDetail.name}
                        <br/>
                        <button className="btn btn-default fa fa-search" onClick={this.props.handleClickBack}></button>
                    </Banner>

                    {this.renderCompetition()}

                    <Banner className="footer">{this.state.postDetail.type}</Banner>
                </Grid>
            );

        } else {
            return (
                <Grid>
                    <Banner className="header">{this.state.postDetail.name}
                        <br/>
                        <button className="btn btn-default fa fa-search" onClick={this.props.handleClickBack}></button>
                    </Banner>
                    <Row>
                        {this.renderCompetitor()}
                    </Row>
                    <Banner className="footer">{this.state.postDetail.type}</Banner>
                </Grid>
            );
        }

    }
}

export default DetailView;
