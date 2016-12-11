import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import {Link} from 'react-router'
import {browserHistory} from 'react-router'

class Results extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.initialState = {
            posts: []
        };
        this.refreshResults = this.refreshResults.bind(this);
    }

    refreshResults() {
        console.log("refresh log");
        axios.get(`http://www.reddit.com/r/${this.props.subreddit}.json`).then(res => {
            const posts = res.data.data.children.map(obj => obj.data);
            this.setState({posts: posts});
        });
    }

    componentDidMount() {
        this.refreshResults()
    }

    componentDidUpdate(nextProps) {
        axios.get(`http://www.reddit.com/r/${this.props.subreddit}.json`).then(res => {
            const posts = res.data.data.children.map(obj => obj.data);
            this.setState({posts});
        });
    }

    numberList(props) {
        const numbers = props.numbers;
        const listItems = numbers.map((number) => <li>{number}</li>);
        return (
            <ul>{listItems}</ul>
        );
    }

    restultList(posts) {
        if (posts.length) {
            posts.map(function(n) {
                //console.log("POSTS", n);
                return (
                    <div>
                        <div class='result-list result-" + i + "'></div>
                        <span class='result-title title-" + i + "'>
                            <a href='https://en.wikipedia.org/wiki/" + url + "' target='_blank'>{n.title}</a>
                        </span>
                        <span class='result-snippet snippet-" + i + "'></span>
                        <span class='result-metadata metadata-" + i + "'></span>
                    </div>
                )
            })
        }
    }

    onSelect(post, e) {
        e.preventDefault();

        const path = `/search/` + post.title
        //browserHistory.push(path)
        if (this.props.onSelect) {
            this.props.onSelect(post);
        }
        return false;
    }

    render() {
        var onClick = this.onSelect;
        return (
            <div>
                <h1 className="title">{`/r/${this.props.subreddit}`}</h1>

                <div className="container">
                    <section className="search-results">
                        <div className="one-half column">
                            <div className="display-results">
                                {this.state.posts.map((post, index) => <div key={index}>
                                    <div className='result-list'></div>
                                    <br/>
                                    <span className='result-title'>
                                        {/* <Link to={`/search`} >{post.title}</Link> */}
                                        <a onClick={onClick = this.onSelect.bind(this, post)} href={post.url} target='_blank'>{post.title}
                                        </a>
                                    </span>
                                    <br/>
                                    <span className='result-snippet'>{post.selftext}</span>
                                    <br/>
                                    <span className='result-metadata'>{"Ups: " + post.ups + " Downs: " + post.downs}</span>
                                    <br/>
                                </div>)}
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        );
    }
}
Results.propTypes = {
    onSelect: React.PropTypes.func
};
export default Results;

// ReactDOM.render(
// <FetchDemo subreddit="reactjs"/>,
//   document.getElementById('root')
// );
