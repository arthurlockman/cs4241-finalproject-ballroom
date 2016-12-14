
const COLORS = ['#43A19E', '#7B43A1', '#F2317A', '#FF9824', '#58CF6C', '#000000']
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function compareNumbers(a, b) {
  return a - b;
}

var App = React.createClass({
	getInitialState: function () {
		return {
			data: [],
			series: ['Am. Waltz', 'Am. Tango'],
			labels: ['0 marks', '1 mark', '2 marks', '3 marks', '4 marks'],
			colors: ['#43A19E', '#7B43A1', '#F2317A', '#FF9824', '#58CF6C']
		}
	},
	componentDidMount: function () {
		this.populateArray();
	},
	populateArray: function () {
		var data = [],
			series = 2,  // Number of charts
			serieLength = 5;
	
		for (var i = series; i--; ) {
			var tmp = [];
			
			for (var j = serieLength; j--; ) {
				tmp.push(getRandomInt(0, 20));
			}
			
			data.push(tmp);			
		}
		
		this.setState({ data: data });
	},
	render: function () {
		return (
			<section>
				<Charts
					data={ this.state.data }
					labels={ this.state.series }
					colors={ this.state.colors }
					barLabels={ this.state.labels }
					height={ 500 }
				/>
			</section>
		);
	}
});

var Charts = React.createClass({
	render: function () {
		var self = this,
			data = this.props.data,
			stacked = this.props.grouping === 'stacked' ? true : false,
			opaque = this.props.opaque,
			max = 0;
		
		for (var i = data.length; i--; ) {
			for (var j = data[i].length; j--; ) {
				if (data[i][j] > max) {
					max = data[i][j];
				}
			}
		}
		
				
		return (
			<div className={ 'Charts' }>
				{ data.map(function (serie, serieIndex) {
				 	var sortedSerie = serie.slice(0),
				 		sum;
				 	
				 	sum = serie.reduce(function (carry, current) {
				 		return carry + current;
					}, 0);
				 	sortedSerie.sort(compareNumbers);				 		
									 
					return (
						<div className={ 'Charts--serie ' + (self.props.grouping) }
				 			key={ serieIndex }
							style={{ height: self.props.height ? self.props.height: 'auto' }}
						>
						<label>{ self.props.labels[serieIndex] }</label>
						{ serie.map(function (item, itemIndex) {
							var color = self.props.colors[itemIndex], style,
								size = item / (stacked ? sum : max) * 100;
							
							style = {
								backgroundColor: color,
								zIndex: item
							};
														
							style['height'] = size + '%';
							
						
						 return (
							 
							 <div
							 	className={ 'Charts--item ' + (self.props.grouping) }
							 	style={ style }
								key={ itemIndex }
							>
							 	<bar_total>{ item + " couples" }</bar_total>
								<bar_label>{ self.props.barLabels[itemIndex] }</bar_label>
							 </div>
						);
						}) }
						</div>
					);
				}) }
			</div>
		);
	}
});

React.render(<App />, document.getElementById('charts'));