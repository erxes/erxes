const HtmlWebPackPlugin = require("html-webpack-plugin");
const path = require("path");

const InterpolateHtmlPlugin = require("interpolate-html-plugin");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");

// replace accordingly './.env' with the path of your .env file
const envs = require("dotenv").config({ path: "./.env" });

const depNames = [
  "apollo-cache-inmemory",
  "apollo-client",
  "apollo-link",
  "apollo-link-context",
  "apollo-link-error",
  "apollo-link-http",
  "apollo-link-ws",
  "apollo-utilities",
  "color",
  "dotenv",
  "graphql",
  "graphql-tag",
  "lodash",
  "lodash.flowright",
  "query-string",
  "react-apollo",
  "react-bootstrap",
  "react-dom",
  "react-router-dom",
  "react-transition-group",
  "styled-components",
  "styled-components-ts",
];

const deps = require("./package.json").dependencies;
const shared = {};

for (const name of depNames) {
  shared[name] = { eager: true };
}

module.exports = {
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
  },

  output: {
    publicPath: "/",
    chunkFilename: "[id].[contenthash].js",
  },

  devServer: {
    port: 3000,
    allowedHosts: "all",
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
        include: [
          path.resolve(__dirname, "src"),
          path.resolve(__dirname, "../erxes-ui/src"),
          path.resolve(__dirname, "../ui-settings/src"),
          path.resolve(__dirname, "../ui-engage/src"),
          path.resolve(__dirname, "../ui-contacts/src"),
          path.resolve(__dirname, "../ui-segments/src"),
          path.resolve(__dirname, "../ui-forms/src"),
          path.resolve(__dirname, "../ui-inbox/src"),
          path.resolve(__dirname, "../ui-products/src"),
          path.resolve(__dirname, "../ui-cards/src"),
          path.resolve(__dirname, "../ui-knowledgeBase/src"),
          path.resolve(__dirname, "../ui-notifications/src"),
          path.resolve(__dirname, "../ui-calendar/src"),
        ],
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              "@babel/preset-typescript",
              "@babel/preset-react",
              "@babel/preset-env",
            ],
            plugins: [["@babel/transform-runtime"]],
          },
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
    fallback: {
      path: require.resolve("path-browserify"),
      timers: require.resolve("timers-browserify"),
      util: require.resolve("util/"),
    },
    alias: {
      "coreui/apolloClient": path.resolve(__dirname, "./src/apolloClient.ts"),
    },
    extensions: ["*", ".js", ".jsx", ".ts", ".tsx"],
  },

  plugins: [
    new InterpolateHtmlPlugin({
      ...envs.parsed,
      PUBLIC_URL: "",
    }),
    new HtmlWebPackPlugin({
      template: path.resolve(__dirname, "public/index.html"),
      filename: "index.html",
      inject: true,
    }),
    new ModuleFederationPlugin({
      name: "coreui",
      filename: "remoteEntry.js",
      exposes: {
        "./appContext": "./src/appContext",
        "./apolloClient": "./src/apolloClient",
        "./withPermission": "./src/modules/common/components/WithPermission",
        "./utils": "./src/modules/common/utils",
        "./pluginUtils": "./src/pluginUtils",
      },
      shared: {
        ...shared,
        "@erxes/ui": {
          requiredVersion: "1.0.0",
          singleton: true,
        },
        dayjs: {
          requiredVersion: deps["dayjs"],
          singleton: true,
        },
        react: {
          requiredVersion: deps["react"],
          singleton: true,
          eager: true,
        },
        "./src/appContext": {},
        "./src/apolloClient": {},
        "./src/modules/common/components/WithPermission": {},
        "./src/modules/common/utils": {},
        "./src/pluginUtils": {},
      },
    }),
  ],
};
