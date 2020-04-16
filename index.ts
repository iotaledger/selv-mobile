/* eslint-disable */
import express from 'express';
import webpack from 'webpack';

const webpackDevMiddleware = require('webpack-dev-middleware');
const config = require('./webpack.config.js');

const app = express();
const compiler = webpack(config);

const PORT = 3001;

app.use(
    webpackDevMiddleware(compiler, {
        publicPath: config.output.publicPath
    })
);

app.listen(PORT, function() {
    console.log(`App running on port ${PORT}`);
});
