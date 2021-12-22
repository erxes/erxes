const deps = require("./package.json").dependencies;

module.exports = {
  name: 'main',
  filename: "remoteEntry.js",
//   exposes: {
//     "./Navigation": "./src/modules/layout/components/QuickNavigation.tsx",
//   },
  //   remotes: {
  //     app2: "app2@http://localhost:3002/remoteEntry.js",
  //   },
    shared: {
      ...deps,
    },
};
