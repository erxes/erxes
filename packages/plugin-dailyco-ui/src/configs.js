module.exports = {
  name: "dailyco",
  scope: "dailyco",
  port: 3024,
  exposes: {
    "./routes": "./src/routes.tsx",
  },
  routes: {
    url: "http://localhost:3024/remoteEntry.js",
    scope: "dailyco",
    module: "./routes",
  },
};
