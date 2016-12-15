var config = {
    entry: './client/App.jsx',

    output: {
        path: './client/',
        filename: 'bundle.js'
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
            },
            {
                test: /\.json$/,
                loader: "json-loader"
            }
        ]
    },
    resolve: {
        extensions: ['', '.js', '.jsx']
    }
}

module.exports = config;
