const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const LiveReloadPlugin = require('webpack-livereload-plugin');

const mode = process.env.NODE_ENV || 'development';
const devMode = mode !== 'production';

const config = {
    entry: {
        bundle: ['./ui/index.js']
    },
    resolve: {
        alias: {
            svelte: path.resolve('node_modules', 'svelte'),
            'svelte/transition': path.resolve('node_modules', 'svelte/transition'),
            'svelte/internal': path.resolve('node_modules', 'svelte/internal'),
            '~': path.resolve('ui')
        },
        extensions: ['.mjs', '.ts', '.js', '.svelte', '.json'],
        mainFields: ['svelte', 'browser', 'module', 'main']
    },
    output: {
        path: `${__dirname}/.build`,
        publicPath: '/',
        filename: '[name].[contenthash].js'
    },
    node: {
        __dirname: false,
        fs: 'empty'
    },
    module: {
        noParse: /\.wasm$/,
        rules: [
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            transpileOnly: true,
                            experimentalWatchApi: true
                        }
                    }
                ],
                exclude: /node_modules/
            },
            {
                test: /\.svelte$/,
                use: {
                    loader: 'svelte-loader',
                    options: {
                        hotReload: devMode,
                        emitCss: true
                    }
                }
            },
            {
                test: /\.wasm$/,
                loaders: ['base64-loader'],
                type: 'javascript/auto'
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            publicPath: '../',
                            hmr: devMode
                        }
                    },
                    'css-loader'
                ]
            }
        ]
    },
    plugins: [
        new CopyPlugin([
            { from: './ui/assets/*', to: './', flatten: true },
            { from: './node_modules/qr-scanner/qr-scanner-worker.min.js', to: './scanner.worker.min.js' },
            {
                from: 'node_modules/@iota/identity-wasm/web/identity_wasm_bg.wasm',
                to: 'identity_wasm_bg.wasm'
            }
        ]),
        new HtmlWebpackPlugin({
            template: './ui/index.html',
            filename: './index.html',
            minify: true,
            devMode
        }),
        new ScriptExtHtmlWebpackPlugin({
            defaultAttribute: 'defer'
        }),
        new WorkboxPlugin.GenerateSW({
            clientsClaim: true,
            skipWaiting: true
        }),
        new MiniCssExtractPlugin()
    ],
    mode
};

if (devMode) {
    config.plugins.push(new LiveReloadPlugin());
}

module.exports = config;
