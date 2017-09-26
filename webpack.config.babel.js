import path from 'path';
import webpack from 'webpack';
import dotenv from 'dotenv';
// import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

dotenv.config();

const {
  ROOT_URL,
  API_SUBSCRIPTIONS_URL,
  API_GRAPHQL_URL,
  MAIN_API_GRAPHQL_URL,
  DDP_URL,
} = process.env;

export default {
  entry: {
    messenger: './client/messenger/index.js',
    messengerWidget: './client/messenger/widget/index.js',
    form: './client/form/index.js',
    formWidget: './client/form/widget/index.js',
    knowledgebase: './client/knowledgebase/index.js',
    knowledgebaseWidget: './client/knowledgebase/widget/index.js',
  },

  output: {
    path: path.join(__dirname, 'static'),
    filename: '[name].bundle.js',
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        options: {
          presets: ['es2015', 'react'],
        },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
        exclude: /node_modules/,
      },
    ],
  },

  resolve: {
    extensions: ['.js', '.jsx'],
  },

  plugins: [
    new webpack.DefinePlugin({
      ROOT_URL: JSON.stringify(ROOT_URL),
      API_SUBSCRIPTIONS_URL: JSON.stringify(API_SUBSCRIPTIONS_URL),
      API_GRAPHQL_URL: JSON.stringify(API_GRAPHQL_URL),
      MAIN_API_GRAPHQL_URL: JSON.stringify(MAIN_API_GRAPHQL_URL),
      DDP_URL: JSON.stringify(DDP_URL),
    }),
    // new BundleAnalyzerPlugin(),
  ],
};
