import React from 'react';
import ReactDOM from 'react-dom';

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

export default Charts;
