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
  },

  output: {
    path: path.join(__dirname,'static'),
    filename: '[name].bundle.js',
    chunkFilename: '[name].[contenthash].js',
  },

  plugins: [new Dotenv()],

  module: {
    rules: [
      {
        test: /\.(ts|tsx|js)$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
            },
          },
        ],
        exclude: /node_modules/,
      },
      // addition - add source-map support
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: 'source-map-loader',
        exclude: [/node_modules/],
      },
      {
        test: /\.(png|woff|woff2|eot|ttf)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 100000,
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: ['style-loader','css-loader'],
      },
      {
        test: /\.scss$/,
        include: [
          path.resolve(__dirname,'client'),
          path.resolve(__dirname,'node_modules/@nateradebaugh/react-datetime'),
        ],
        use: ['style-loader','css-loader','sass-loader'],
      },
      {
        test: /\.(eot|woff|woff2|ttf|svg|png|jpg|gif)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 30000,
              name: '[name]-[hash].[ext]',
              outputPath: 'fonts/',
              publicPath: '/fonts/',
            },
          },
        ],
      },
    ],
  },

  // addition - add source-map support
  devtool: 'source-map',

  resolve: {
    extensions: ['.js','.ts','.tsx','.json'],
    modules: [path.resolve(__dirname,'node_modules'),'node_modules'],
    alias: {
      'zen-observable-ts': require.resolve('zen-observable-ts')
    }
  },
};
