module.exports = {
  entry: './client/index.js',

  output: {
    path: __dirname,
    filename: './client/bundle.js',
  },

  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'react'],
        },
      },

      {
        test: /\.scss$/,
        loaders: ['style-loader', 'css-loader', 'sass-loader'],
      },
    ],
  },

  resolve: {
    extensions: ['', '.js', '.jsx'],
  },
};
