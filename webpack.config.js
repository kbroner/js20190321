const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require("copy-webpack-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin');
const dotenv = require('dotenv');
const webpack = require('webpack');


const isDev = process.env.NODE_ENV !== 'production';
const env = dotenv.config({
  path: '.env'
}).parsed;

module.exports = {
  entry: './scripts/index.js',
  output: {
    filename: isDev ? 'bundle.js' : 'bundle.[hash:4].js',
    path: path.resolve(__dirname, 'public')
  },
  mode: isDev ? 'none' : 'production',
  devtool: 'source-map',
  devServer: {
    contentBase: './public'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-transform-runtime']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      }
    ]
  },
  plugins: [
    ...(isDev ? [] : [new CleanWebpackPlugin()]),
    new HtmlWebpackPlugin({
      template: './index.html',
      filename: './index.html'
    }),
    new CopyWebpackPlugin([
      { from: "./index.css" }
    ]),
    new webpack.DefinePlugin({
      TEST: JSON.stringify(env.TEST)
    })
  ]
};