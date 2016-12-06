var config = {
   entry: './App.jsx',
	
   output: {
      path:'./',
      filename: 'bundle.js',
   },
	
   devServer: {
      inline: true,
      port: 8080
   },
	
   module: {
      loaders: [
         {
            test: /\.(js|jsx?)$/,
            exclude: /node_modules/,
            loader: 'babel',
				
            query: {
               presets: ['es2015', 'react']
            }
         }
      ]
   },
   resolve: {
    extensions: ['', '.js', '.jsx']
  }
}

module.exports = config;
