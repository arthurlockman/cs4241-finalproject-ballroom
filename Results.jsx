import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import {Link} from 'react-router'
import {browserHistory} from 'react-router'

const baseURL = "https://cs4241-fp-arthurlockman.herokuapp.com"

class Results extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.initialState = {
            posts: []
        };
    }

    componentDidMount() {
        //this.refreshResults()
    }

    numberList(props) {
        const numbers = props.numbers;
        const listItems = numbers.map((number) => <li>{number}</li>);
        return (
            <ul>{listItems}</ul>
        );
    }

    // restultList(posts) {
    //     if (posts.length) {
    //         posts.map(function(n) {
    //             //console.log("POSTS", n);
    //             return (
    //                 <div>
    //                     <div class='result-list result-" + i + "'></div>
    //                     <span class='result-title title-" + i + "'>
    //                         <a href='https://en.wikipedia.org/wiki/" + url + "' target='_blank'>{n.title}</a>
    //                     </span>
    //                     <span class='result-snippet snippet-" + i + "'></span>
    //                     <span class='result-metadata metadata-" + i + "'></span>
    //                 </div>
    //             )
    //         })
    //     }
    // }

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
                <h1 className="title">{`${this.props.subreddit}`}</h1>

                <div className="container">
                    <section className="search-results">
                        <div className="one-half column">
                            <div className="display-results">
                                {this.props.posts.map((post, index) => <div key={index}>
                                    <div className='result-list'></div>
                                    <br/>
                                    <span className='result-title'>
                                        {/* <Link to={`/search`} >{post.title}</Link> */}
                                        <a onClick={onClick = this.onSelect.bind(this, post)} href={baseURL+post.link} target='_blank'>{post.name}
                                        </a>
                                    </span>
                                    <br/>
                                    <span className='result-snippet'>{post.body}</span>
                                    <br/>
                                    <span className='result-metadata'>{post.type}</span>
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
