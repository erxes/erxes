module.exports = {
  name: "products",
  port: 3002,
  exposes: {
    "./routes": "./src/routes.tsx",
  },
  routes: {
    url: "http://localhost:3002/remoteEntry.js",
    scope: "products",
    module: "./routes",
  },
  menus: [
    {
      text: "Product and services",
      url: "/settings/product-service/",
      icon: "icon-book-open",
      location: "mainNavigation",
    },
  ],
};