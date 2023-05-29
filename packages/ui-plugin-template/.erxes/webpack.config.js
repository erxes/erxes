const webpack = require("webpack");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const path = require("path");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const TerserPlugin = require("terser-webpack-plugin");
const InterpolateHtmlPlugin = require("interpolate-html-plugin");
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
//   .BundleAnalyzerPlugin;
const { MFLiveReloadPlugin } = require("@module-federation/fmr");

const configs = require("./plugin-src/configs");
const { port = 3000 } = configs;

const exposes = {};

for (const expose of Object.keys(configs.exposes || {})) {
  exposes[expose] = configs.exposes[expose].replace("src", "plugin-src");
}

// replace accordingly './.env' with the path of your .env file
require("dotenv").config({ path: "./.env" });

const deps = require("./package.json").dependencies;
const depNames = Object.keys(deps);

const shared = {};

for (const name of depNames) {
  shared[name] = {
    singleton: true,
    requiredVersion: deps[name],
  };
}

module.exports = (env, args) => {
  return {
    output: {
      uniqueName: configs.name,
      publicPath:
        args.mode === "development" ? `http://localhost:${port}/` : undefined,
      chunkFilename: "[chunkhash].js",
    },

    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          extractComments: false,
          terserOptions: {
            parse: {
              ecma: 8,
            },
            compress: {
              ecma: 5,
              warnings: false,
              comparisons: false,
              inline: 2,
            },
            mangle: true,
            output: {
              ecma: 5,
              comments: false,
              ascii_only: true,
            },
          },
        }),
      ]
    },

    resolve: {
      extensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
      fallback: {
        path: require.resolve("path-browserify"),
        timers: require.resolve("timers-browserify"),
      },
    },

    devServer: {
      port: port,
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
          test: /\.json$/,
          loader: "json-loader",
        },
        {
          test: /\.(ts|tsx|js|jsx)$/,
          exclude: /node_modules/,
          include: [
            path.resolve(__dirname, "src"),
            path.resolve(__dirname, "../../erxes-ui/src"),
            path.resolve(__dirname, "../../ui-settings/src"),
            path.resolve(__dirname, "../../ui-engage/src"),
            path.resolve(__dirname, "../../ui-contacts/src"),
            path.resolve(__dirname, "../../ui-segments/src"),
            path.resolve(__dirname, "../../ui-forms/src"),
            path.resolve(__dirname, "../../ui-inbox/src"),
            path.resolve(__dirname, "../../ui-products/src"),
            path.resolve(__dirname, "../../ui-cards/src"),
            path.resolve(__dirname, "../../ui-knowledgebase/src"),
            path.resolve(__dirname, "../../ui-notifications/src"),
            path.resolve(__dirname, "../../ui-automations/src"),
            path.resolve(__dirname, "../../ui-calendar/src"),
            path.resolve(__dirname, "../../ui-log/src"),
            path.resolve(__dirname, "../../ui-internalnotes/src"),
            path.resolve(__dirname, "../../ui-leads/src"),
            path.resolve(__dirname, "../../ui-tags/src"),
            path.resolve(__dirname, "plugin-src"),
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
      ],
    },

    plugins: [
      new webpack.DefinePlugin({
        "process.env": JSON.stringify(process.env),
      }),      
      new NodePolyfillPlugin({
        includeAliases: ['process']
      }),
      new InterpolateHtmlPlugin({
        PUBLIC_URL: "public", // can modify `static` to another name or get it from `process`
      }),
      new ModuleFederationPlugin({
        name: configs.name,
        filename: "remoteEntry.js",
        remotes: {
          coreui: `promise new Promise(resolve => {
          const { REACT_APP_PUBLIC_PATH } = window.env || {};
          const remoteUrl = (REACT_APP_PUBLIC_PATH ? REACT_APP_PUBLIC_PATH : window.location.origin) + '/remoteEntry.js';

          const id = 'coreuiRemoteEntry';

          // the injected script has loaded and is available on window
          // we can now resolve this Promise
          const proxy = {
            get: (request) => window.coreui.get(request),
            init: (arg) => {
              try {
                return window.coreui.init(arg)
              } catch(e) {
                console.log('remote container already initialized')
              }
            }
          }

          const script = document.createElement('script');
          script.src = remoteUrl;
          script.id = id;
          script.onload = () => {
            resolve(proxy)
          }

          if (document.getElementById(id) && window.coreui) {
            resolve(proxy)
          } else {
            // inject this script with the src set to the versioned remoteEntry.js
            document.head.appendChild(script);
          }
        })
        `,
        },
        exposes,
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
        },
      }),
      new HtmlWebPackPlugin({
        template: "./src/index.html",
      }),
      args.mode === "development"
        ? new MFLiveReloadPlugin({
            port, // the port your app runs on
            container: configs.name, // the name of your app, must be unique
            standalone: false, // false uses chrome extention
          })
        : false,
      // new BundleAnalyzerPlugin()
    ].filter(Boolean),
  };
};
