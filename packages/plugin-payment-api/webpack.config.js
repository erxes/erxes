const path = require('path');

module.exports = {
  mode: 'development',
  entry: ['babel-polyfill', './src/paymentGateway/src/index.tsx'],
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        include: path.join(__dirname, 'src'),
        // exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-typescript',
              '@babel/preset-react',
            ],
            plugins: [['@babel/plugin-proposal-class-properties']],
          },
        },
      },
         // addition - add source-map support
         {
          enforce: 'pre',
          test: /\.js$/,
          loader: 'source-map-loader',
          exclude: [/node_modules/],
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
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
          test: /\.scss$/,
          use: ['style-loader', 'css-loader', 'sass-loader'],
          exclude: [/node_modules/],
        },
        {
          test: /\.(eot|woff|woff2|ttf|svg|png|jpg|gif)$/,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 30000,
                name: '[name]-[hash].[ext]',
              },
            },
          ],
        },
    ],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, './src/public/js'),
  },

  devServer: {
      static: {
          directory: path.join(__dirname, 'src/public'),
      },
  },
};
