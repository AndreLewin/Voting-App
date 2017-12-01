const express = require('express');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    entry: {
        app: [__dirname + '/client/index.jsx']
    },
    output: {
        filename: '[name].js',
        publicPath: 'http://localhost:3000/assets',
        path: '/',
    },
    devServer: {
        hot: true,
        inline: true,
        watchOptions: {
            ignored: ['node_modules/', 'test/', 'server/', 'test/', 'public/'],
        },
    },
    module: {
        rules: [
            {
                test: /\.(css|scss)$/,
                exclude: /(node_modules)/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: ['css-loader?url=false', 'sass-loader']
                })
            },
            {
                test: /\.(js|jsx)$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['react', 'stage-0']
                    }
                }
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin('style.css'),
    ]
}