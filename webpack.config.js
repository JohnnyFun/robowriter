// based on https://github.com/sveltejs/template-webpack
// no babel, so only works in modern browsers, which is probably fine
const mode = process.env.NODE_ENV || 'development';
const prod = mode === 'production';
const path = require('path')
const resolveClient = relativePath => path.resolve('./src/client', relativePath || '.')
const resolveDist = relativePath => path.resolve('./dist', relativePath || '.')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const LiveReloadPlugin = require('webpack-livereload-plugin')

module.exports = {
	mode,
	devtool: prod ? false: 'source-map',
	entry: resolveClient('main.js'),
	output: {
		path: resolveDist(),
		filename: '[name].[hash].js'
	},
  resolve: {
		extensions: ['.mjs', '.js', '.svelte'],
    mainFields: ['svelte', 'browser', 'module', 'main'],
    modules: [resolveClient(), 'node_modules']
  },
  module: {
		rules: [
			{
				test: /\.svelte$/,
				use: {
					loader: 'svelte-loader',
					options: {
						emitCss: true
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
			filename: resolveDist('[name].[chunkhash].css')
		}),
		new HtmlWebpackPlugin({
			// https://github.com/jantimon/html-webpack-plugin#options
			template: resolveClient('index.html')
		}),
		prod ? null : new LiveReloadPlugin({
			port: 5002,
			appendScriptTag: true
		})
	].filter(p => p !== null)
}