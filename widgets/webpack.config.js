const path = require('path');
const Dotenv = require('dotenv-webpack');

module.exports = {
  entry: {
    manager: './client/manager.ts',
    messenger: './client/messenger/index.ts',
    messengerWidget: './client/messenger/widget/index.ts',
    form: './client/form/index.ts',
    formWidget: './client/form/widget/index.ts',
    knowledgebase: './client/knowledgebase/index.tsx',
    knowledgebaseWidget: './client/knowledgebase/widget/index.ts',
    events: './client/events/index.ts',
    eventsWidget: './client/events/widget/index.ts',
    booking: './client/booking/index.tsx',
    bookingWidget: './client/booking/widget/index.ts'
  },

  output: {
    path: path.join(__dirname, 'static'),
    filename: '[name].bundle.js'
  },

  plugins: [new Dotenv()],

  module: {
    rules: [
      {
        test: /\.(t|j)sx?$/,
        loader: 'awesome-typescript-loader',
        exclude: /node_modules/
      },
      // addition - add source-map support
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: 'source-map-loader',
        exclude: [/node_modules/]
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        loader: 'url-loader?limit=100000'
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
        exclude: [/node_modules/]
      }
    ]
  },

  // addition - add source-map support
  devtool: 'source-map',

  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.json']
  }
};
