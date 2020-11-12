const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const LiveReloadPlugin = require('webpack-livereload-plugin');

const mode = process.env.NODE_ENV || 'development';
const devMode = mode !== 'production';

const svelteConfig = require('./svelte.config');

const config = {
    entry: {
        bundle: ['./ui/index.ts'],
    },
    devtool: 'source-map',
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
        filename: '[name].[contenthash].js',
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
                            experimentalWatchApi: true,
                        },
                    },
                ],
                exclude: /node_modules/
            },
            {
                test: /\.svelte$/,
                use: {
                    loader: 'svelte-loader',
                    options: {
                        hotReload: devMode,
                        dev: devMode,
                        emitCss: true,
                        ...svelteConfig,
                    },
                },
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
                            hmr: devMode,
                        },
                    },
                    'css-loader',
                ],
            },
        ],
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: './ui/assets/*', to: './', flatten: true },
                { from: './node_modules/qr-scanner/qr-scanner-worker.min.js', to: './scanner.worker.min.js' },
                { from: 'node_modules/iota-identity-wasm-test/web/iota_identity_wasm_bg.wasm', to: 'iota_identity_wasm_bg.wasm' },
                { from: 'node_modules/iota-identity-wasm-test/web/iota_identity_wasm.d.ts', to: 'iota_identity_wasm.d.ts' }
            ]
        }),
        new HtmlWebpackPlugin({
            template: './ui/index.html',
            filename: './index.html',
            minify: true,
            devMode,
        }),
        new ScriptExtHtmlWebpackPlugin({
            defaultAttribute: 'defer',
        }),
        new WorkboxPlugin.GenerateSW({
            clientsClaim: true,
            skipWaiting: true,
        }),
        new MiniCssExtractPlugin(),
    ],
    mode,
    watchOptions: {
        poll: 1000,
        aggregateTimeout: 500,
    },
    devServer: {
        host: '0.0.0.0',
        contentBase: path.join(__dirname, '.build'),
        compress: true,
        port: 3001,
    }
};

if (devMode) {
    config.plugins.push(new LiveReloadPlugin());
}

module.exports = config;
