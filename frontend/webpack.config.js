const path = require('path');
const dotenv = require('dotenv');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader-v16');

dotenv.config();


module.exports = {
  mode: 'development',
  entry: './src/app.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'app.js',
    publicPath: '/'
  },
  resolve: {
    extensions: ['.ts', '.js', '.vue']
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader-v16'
      },
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: {
          appendTsSuffixTo: [/\.vue$/]
        }
      },
      {
        test: /\.scss$/,
        use: [
          'vue-style-loader',
          'css-loader',
          'sass-loader',
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
              additionalData: '@import "./src/assets/scss/_variables.scss";'
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        VUE_APP_BASE_URI: JSON.stringify(process.env.VUE_APP_BASE_URI),
        VUE_STRIPE_PRICE_ID_STANDARD_MONTH: JSON.stringify(process.env.VUE_STRIPE_PRICE_ID_STANDARD_MONTH),
        VUE_STRIPE_PRICE_ID_STANDARD_YEAR: JSON.stringify(process.env.VUE_STRIPE_PRICE_ID_STANDARD_YEAR),
        VUE_STRIPE_PRICE_ID_ENTERPRISE_MONTH: JSON.stringify(process.env.VUE_STRIPE_PRICE_ID_ENTERPRISE_MONTH),
        VUE_STRIPE_PRICE_ID_ENTERPRISE_YEAR: JSON.stringify(process.env.VUE_STRIPE_PRICE_ID_ENTERPRISE_YEAR),
        VUE_STRIPE_PUB_KEY: JSON.stringify(process.env.VUE_STRIPE_PUB_KEY),
      }
    }),
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      template: 'public/index.html'
    })
  ],
  devServer: {
    hot: true,
    open: true,
    port: 8080,
    static: {
      directory: path.join(__dirname, 'public')
    },
    historyApiFallback: true
  }
};
