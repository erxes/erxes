module.exports = {
  srcDir: __dirname,
  name: "{name}",
  port: 3128,
  scope: "{name}",
  exposes: {
    "./routes": "./src/routes.tsx",
  },
  routes: {
    url: "http://localhost:3128/remoteEntry.js",
    scope: "{name}",
    module: "./routes",
  },
  menus: [],
};
