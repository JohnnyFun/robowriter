// based on https://github.com/sveltejs/template-webpack
// no babel, so only works in modern browsers, which is probably fine
const mode = process.env.NODE_ENV || 'development'
console.log(`----------------------\nBuilding client in ${mode} mode\n----------------------`)
const prod = mode === 'production'
const path = require('path')
const resolveClient = relativePath => path.resolve('./src/client', relativePath || '.')
const resolveDist = relativePath => path.resolve('./dist', relativePath || '.')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { ports } = require('./src/shared/constants')

module.exports = {
	mode,
	entry: resolveClient('main.js'),
	output: {
		path: resolveDist(),
		filename: '[name].[hash].js'
	},
  resolve: {
		extensions: ['.mjs', '.js', '.svelte'],
    mainFields: ['svelte', 'browser', 'module', 'main'],
    modules: [
			resolveClient(), 
			path.resolve('./src'),
			'node_modules'
		]
  },
  module: {
		rules: [
			{
				test: /\.svelte$/,
				use: {
					loader: 'svelte-loader',
					options: {
						emitCss: true,
						hotReload: false
					}
				}
			},
			{
				test: /\.css$/,
				use: [
					// MiniCssExtractPlugin doesn't support HMR. For developing, use 'style-loader' instead.
					prod ? MiniCssExtractPlugin.loader : 'style-loader',
					'css-loader'
				]
			}
		]
	},
  plugins: [
		new MiniCssExtractPlugin({
			filename: '[name].[chunkhash].css'
		}),
		new HtmlWebpackPlugin({
			// https://github.com/jantimon/html-webpack-plugin#options
			template: resolveClient('index.html')
		})
	],
	devtool: prod ? false: 'source-map',
	devServer: {
		contentBase: resolveDist(),
		hot: false,
		host: "0.0.0.0",
		port: ports.client
	}
}