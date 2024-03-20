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
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
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
