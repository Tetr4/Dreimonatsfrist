var path = require('path');
var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        app: "./src/app",
        users: "./src/users"
    },
    output: {
        path: "./dist",
        filename: "[name].bundle.js"
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            'window.jQuery': 'jquery'
        }),
        new CopyWebpackPlugin([{
            from: 'static'
        }]),
        new webpack.optimize.UglifyJsPlugin()
    ],
    module: {
        loaders: [{
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            },
            {
                test: /\.css$/,
                loader: "style-loader!css-loader"
            },
            {
                test: /.jpe?g$|.gif$|.png$|.svg$|.woff$|.woff2$|.ttf$|.eot$/,
                loader: "url-loader"
            },
        ]
    }
};
