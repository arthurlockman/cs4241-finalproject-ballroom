// import "babel/polyfill";
import './babel-polyfill/src/index.js'
import React from 'react';
import ReactDOM from 'react-dom';
import SearchBar from './src/SearchBar.jsx';
import Results from './Results.jsx';
import axios from 'axios';

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
            searchTerm: ''
        };
        this.onSearch = this.onSearch.bind(this);
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
    }
    render() {
        console.log("this.state.searchTerm", this.state.searchTerm);
        return (
            <div>
                <SearchBar placeholder="search..." onChange={this.onChange} onSearch={this.onSearch} didSearch={this.state.didSearch}/> {this.state.didSearch
                    ? (<Results subreddit={this.state.searchTerm}/>)
                    : (
                        <div></div>
                    )}
            </div>
        );
    }
}

ReactDOM.render(
    <App/>, document.getElementById('root'));
