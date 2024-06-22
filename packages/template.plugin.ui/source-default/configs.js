module.exports = {
  srcDir: __dirname,
  name: "{name}",
  port: 3126,
  scope: "{name}",
  exposes: {
    "./routes": "./src/routes.tsx",
  },
  routes: {
    url: "http://localhost:3126/remoteEntry.js",
    scope: "{name}",
    module: "./routes",
  },
  menus: [],
};
