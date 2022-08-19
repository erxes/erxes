module.exports = {
  name: "products",
  port: 3022,
  exposes: {
    "./routes": "./src/routes.tsx",
  },
  routes: {
    url: "http://localhost:3022/remoteEntry.js",
    scope: "products",
    module: "./routes",
  },
  menus: [
    {
      text: "Product and services",
      to: "/settings/product-service/",
      image: "/images/icons/erxes-31.png",
      location: "settings",
      scope: "products",
      action: "productsAll",
      permissions: ["showProducts", "manageProducts"],
    },
    {
      text: "Configs of Products",
      to: "/settings/products-config/",
      image: "/images/icons/erxes-24.svg",
      location: "settings",
      scope: "products",
      action: "productsAll",
      permissions: ["showProducts", "manageProducts"],
    },
  ],
};
