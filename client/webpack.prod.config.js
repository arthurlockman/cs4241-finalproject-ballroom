var Webpack = require('webpack');
var nodeExternals = require('webpack-node-externals');

var config = {
    entry: './client/App.jsx',
    target: 'node',
    externals: [nodeExternals()],
    output: {
        path: './client/',
        filename: 'bundle.js'
    },

    module: {
        loaders: [
            {
                test: /\.(js|jsx?)$/,
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
