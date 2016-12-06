// import "babel/polyfill";
import './babel-polyfill/src/index.js'
import React from 'react';
import ReactDOM from 'react-dom';
import SearchBar from './src/SearchBar.jsx';
import FetchDemo from './GetForum.jsx';
import axios from 'axios';

var matches
var posts

// const matches = {
//     'b': [
//         'ballroom', 'b something', 'be cool'
//     ],
//     'ballroo': ['ballroom dance', 'ballroom dico', 'ballroom dance dance']
//     // ,
//     // 'macbook p': [
//     //   'macbook pro 13 case',
//     //   'macbook pro 15 case',
//     //   'macbook pro charger'
//     // ]
// };

function getSubreddit() {
    axios.get(`http://www.reddit.com/r/ballroom.json`).then(res => {
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

getSubreddit()

const App = React.createClass({

    onChange(input, resolve) {
        getSubreddit()
        // Simulate AJAX request
        //console.log("matches", matches);
        setTimeout(() => {
            const suggestions = matches[Object.keys(matches).find((partial) => {
                    return input.match(new RegExp(partial), 'i');
                })] || matches;

            resolve(suggestions.filter((suggestion) => suggestion.match(new RegExp('^' + input.replace(/\W\s/g, ''), 'i'))));
        }, 25);
    },
    onSearch(input) {
        if (!input) 
            return;
        console.info(`Searching "${input}"`);
        window.location.href = searchName(input)
    },
    render() {
        return (
            <div>
                <SearchBar placeholder="search..." onChange={this.onChange} onSearch={this.onSearch}/> {/* <p>Hello</p> */}
                <FetchDemo subreddit="ballroom"/>
            </div>
        );
    }
});

ReactDOM.render(
    <App/>, document.getElementById('root'));
