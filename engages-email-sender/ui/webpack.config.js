const webpack = require('webpack');
const HtmlWebPackPlugin = require("html-webpack-plugin");
const path = require("path");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");

const InterpolateHtmlPlugin = require("interpolate-html-plugin");

// replace accordingly './.env' with the path of your .env file 
require('dotenv').config({ path: './.env' }); 

const deps = require("./package.json").dependencies;
const depNames = Object.keys(deps);

const shared = {};

for (const name of depNames) {
  shared[name] = {
    eager: true
  }
}

module.exports = {
  output: {
    publicPath: "http://localhost:3001/",
  },

  optimization: { runtimeChunk: false, splitChunks: false },

  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
  },

  devServer: {
    port: 3001,
    historyApiFallback: true,
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
    ],
  },

  resolve: {
    modules: [path.resolve(__dirname, "src"), "node_modules"],
    // fallback: { "path": require.resolve("path-browserify"), "timers": require.resolve("timers-browserify") },
    extensions: ["*", ".js", ".jsx", ".ts", ".tsx"],
  },

  plugins: [
    new webpack.DefinePlugin({
      "process.env": JSON.stringify(process.env)
    }),
    new InterpolateHtmlPlugin({
      PUBLIC_URL: 'public' // can modify `static` to another name or get it from `process`
    }),
    new ModuleFederationPlugin({
      name: "engages",
      filename: "remoteEntry.js",
      remotes: {},
      exposes: {
        "./routes": './src/routes.tsx'
      },
      shared
    }),
    new HtmlWebPackPlugin({
      template: "./src/index.html",
    }),
  ],
};