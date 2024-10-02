module.exports = {
  srcDir: __dirname,
  name: "pms",
  port: 3126,
  scope: "pms",
  exposes: {
    "./routes": "./src/routes.tsx",
  },
  routes: {
    url: "http://localhost:3126/remoteEntry.js",
    scope: "pms",
    module: "./routes",
  },
  menus:[{"text":"Pmss","url":"/pmss","icon":"icon-star","location":"mainNavigation"}],
};
