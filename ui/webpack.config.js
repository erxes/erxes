const HtmlWebPackPlugin = require("html-webpack-plugin");
const path = require("path");

const InterpolateHtmlPlugin = require("interpolate-html-plugin");

// replace accordingly './.env' with the path of your .env file
const envs = require("dotenv").config({ path: "./.env" });

module.exports = {
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
  },

  output: {
    publicPath: '/'
  },

  devServer: {
    port: 3000,
    historyApiFallback: true
  },

  module: {
    rules: [
      {
        test: /\.m?js/,
        type: "javascript/auto",
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.(css|s[ac]ss)$/i,
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
      {
        test: /\.(ts|tsx|js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.json$/,
        use: {
          loader: "json-loader",
        },
      },
    ],
  },

  resolve: {
    modules: [path.resolve(__dirname, "src"), "node_modules"],
    fallback: { "path": require.resolve("path-browserify"), "timers": require.resolve("timers-browserify"), "util": require.resolve("util/") },
    extensions: ["*", ".js", ".jsx", ".ts", ".tsx"],
  },

  plugins: [
    new InterpolateHtmlPlugin({
      ...envs.parsed,
      PUBLIC_URL: ''
    }),
    new HtmlWebPackPlugin({
      template: path.resolve( __dirname, 'public/index.html' ),
      filename: 'index.html',
      inject: true,
    }),
  ],
};