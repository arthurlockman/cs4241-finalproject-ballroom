import React from 'react';
import ReactDOM from 'react-dom';
import { VictoryPie } from 'victory';
import axios from 'axios';


class DetailView extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.initialState = {};
    }
    componentDidMount() {}

    componentWillUpdate(nextProps) {}

    render() {
        return (
          <VictoryPie />
        );
    }
}

export default DetailView;

// ReactDOM.render(
// <FetchDemo subreddit="reactjs"/>,
//   document.getElementById('root')
// );
