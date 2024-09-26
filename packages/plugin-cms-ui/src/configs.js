module.exports = {
  srcDir: __dirname,
  name: "cms",
  port: 3126,
  scope: "cms",
  exposes: {
    "./routes": "./src/routes.tsx",
  },
  routes: {
    url: "http://localhost:3126/remoteEntry.js",
    scope: "cms",
    module: "./routes",
  },
  menus:[{"text":"Cmss","url":"/cmss","icon":"icon-star","location":"mainNavigation"}],
};
