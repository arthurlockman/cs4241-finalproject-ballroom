// import "babel/polyfill";
import './babel-polyfill/src/index.js'
import React from 'react';
import ReactDOM from 'react-dom';
import SearchBar from './src/SearchBar.jsx';
import Results from './Results.jsx';
import DetailView from './DetailView.jsx';
import axios from 'axios';
import {Router, Route, Link, browserHistory} from 'react-router'

// var matches
// var posts
//
// function queryServer(sub) {
//     axios.get('http://www.reddit.com/r/' + sub + '.json').then(res => {
//         posts = res.data.data.children.map(obj => obj.data);
//         matches = posts.map(function(a) {
//             return a.title;
//         });
//     });
// }
//
// function searchName(name) {
//     for (var i = 0; i < posts.length; i++) {
//         if (posts[i].title.toLowerCase().indexOf(name.toLowerCase()) !== -1) {
//             return posts[i].url
//         }
//     }
// }

class App extends React.Component {

    constructor(props, context) {
        super(props, context);
        this.state = {
            didSearch: false,
            detailView: false,
            postDetail: '',
            searchTerm: '',
            posts: [],
            matches: []
        };
        this.onSearch = this.onSearch.bind(this);
        this.showDetailView = this.showDetailView.bind(this);
        this.queryServer = this.queryServer.bind(this);
        this.getAutocomplete = this.getAutocomplete.bind(this);
        this.onChange = this.onChange.bind(this);
        this.showSearch = this.showSearch.bind(this);
    }
    componentDidMount() {
        this.getAutocomplete();
    }

    queryServer(query) {
        axios.get('https://cs4241-fp-arthurlockman.herokuapp.com/api/search/' + query).then(res => {
            // const posts = res.data.map(obj => obj.data);
            this.setState({posts: res.data});
        });
    }

    getAutocomplete() {
        axios.get('https://cs4241-fp-arthurlockman.herokuapp.com/api/autocomplete').then(res => {
            // var m = posts.map(function(a) {
            //     return a.title;
            // });
            //console.log('getAutocomplete', res.data);
            this.setState({matches: res.data});
        });
    }

    onChange(input, resolve) {
        setTimeout(() => {
            console.log('timeout');
            const suggestions = this.state.matches;
            // const suggestions = matches[Object.keys(matches).find((partial) => {
            //         return input.match(new RegExp(partial), 'i');
            //     })] || matches
            try {
                resolve(suggestions.filter((suggestion) => suggestion.match(new RegExp('^' + input.replace(/\W\s/g, ''), 'i'))));
            } catch (err) {
                console.log(err);
            }
        }, 25);

    }

    onSearch(input) {
        if (!input) 
            return;
        console.info(`Searching "${input}"`);
        //window.location.href = searchName(input)
        this.setState({didSearch: true});
        this.setState({searchTerm: input});
        this.queryServer(input)
        // this.refs.results.refreshResults()
    }

    showDetailView(post) {
        this.setState({postDetail: post});
        this.setState({detailView: true});
    }
    
    showSearch() {
      this.setState({postDetail: null});
      this.setState({detailView: false});
      this.setState({didSearch: false});
    }

    switchView() {
        if (this.state.detailView) {
            return (
                <div>
                    <DetailView postDetail={this.state.postDetail} handleClickBack={this.showSearch}/>
                </div>
            )
        } else if (this.state.didSearch) {
            return (
                <div>
                    <SearchBar placeholder="search..." onChange={this.onChange} onSearch={this.onSearch} didSearch={this.state.didSearch}/>
                    <Results posts={this.state.posts} subreddit={this.state.searchTerm} onSelect={this.showDetailView}/>
                </div>
            )
        } else {
            return (
                <div>
                    {/* <DetailView postDetail={this.state.postDetail} handleClickBack={this.showSearch}/> */}
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
    <App/>, document.getElementById('root'));
