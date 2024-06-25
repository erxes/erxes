module.exports = {
  srcDir: __dirname,
  name: "templates",
  port: 3128,
  scope: "templates",
  exposes: {
    "./routes": "./src/routes.tsx",
  },
  routes: {
    url: "http://localhost:3128/remoteEntry.js",
    scope: "templates",
    module: "./routes",
  },
  menus: [{ "text": "Templates", "to": "/settings/templates", "image": "/images/icons/erxes-18.svg", "location": "settings", "scope": "templates" }],
};
