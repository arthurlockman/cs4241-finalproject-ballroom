// import "babel/polyfill";
import './babel-polyfill/src/index.js'
import React from 'react';
import ReactDOM from 'react-dom';
import SearchBar from './src/SearchBar.jsx';
import Results from './Results.jsx';
import DetailView from './DetailView.jsx';
import axios from 'axios';
import {Router, Route, Link, browserHistory} from 'react-router'

var matches
var posts

function getSubreddit(sub) {
    axios.get('http://www.reddit.com/r/' + sub + '.json').then(res => {
        posts = res.data.data.children.map(obj => obj.data);
        matches = posts.map(function(a) {
            return a.title;
        });
    });
}

function searchName(name) {
    for (var i = 0; i < posts.length; i++) {
        if (posts[i].title.toLowerCase().indexOf(name.toLowerCase()) !== -1) {
            return posts[i].url
        }
    }
}

class App extends React.Component {

    constructor(props, context) {
        super(props, context);
        this.state = {
            didSearch: false,
            detailView: false,
            postDetail: '',
            searchTerm: ''
        };
        this.onSearch = this.onSearch.bind(this);
        this.showDetailView = this.showDetailView.bind(this);
    }

    onChange(input, resolve) {
        //getSubreddit()
        // Simulate AJAX request
        //console.log("matches", matches);
        setTimeout(() => {
            // const suggestions = matches[Object.keys(matches).find((partial) => {
            //         return input.match(new RegExp(partial), 'i');
            //     })] || matches;
            const suggestions = matches;
            resolve(suggestions.filter((suggestion) => suggestion.match(new RegExp('^' + input.replace(/\W\s/g, ''), 'i'))));
        }, 25);
    }
    onSearch(input) {
        if (!input) 
            return;
        console.info(`Searching "${input}"`);
        //window.location.href = searchName(input)
        this.setState({didSearch: true});
        this.setState({searchTerm: input});
        getSubreddit(input)
        // this.refs.results.refreshResults()
    }

    showDetailView(post) {
        this.setState({postDetail: post});
        this.setState({detailView: true});
    }

    switchView() {
        if (this.state.detailView) {
            return (
                <div>
                    <DetailView postDetail={this.state.postDetail}/>
                </div>
            )
        } else if (this.state.didSearch) {
            return (
                <div>
                    <SearchBar placeholder="search..." onChange={this.onChange} onSearch={this.onSearch} didSearch={this.state.didSearch}/>
                    <Results subreddit={this.state.searchTerm} onSelect={this.showDetailView}/>
                </div>
            )
        } else {
            return (
                <div>
                    <SearchBar placeholder="search..." onChange={this.onChange} onSearch={this.onSearch} didSearch={this.state.didSearch}/>
                </div>
            )
        }
    }

    render() {
        console.log("this.state.searchTerm", this.state.searchTerm);
        return (this.switchView());
    }
}

ReactDOM.render(
    <Router history={browserHistory}>
    <Route path="/" component={App}>
        <Route path="search" component={Results}/>
        <Route path="search/:query" component={Results}/>
        <Route path="info" component={DetailView}/>
    </Route>
</Router>, document.getElementById('root'));
