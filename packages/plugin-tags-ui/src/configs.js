module.exports = {
  name: "tags",
  port: 3012,
  exposes: {
    "./routes": "./src/routes.tsx",
  },
  routes: {
    url: "http://localhost:3012/remoteEntry.js",
    scope: "tags",
    module: "./routes",
  },
  menus: [
    {
      text: "Tags",
      to: "/tags",
      image: "/images/icons/erxes-18.svg",
      location: "settings",
      scope: "tags",
      action: "tagsAll",
      permissions: ["showTags", "manageTags"],
    },
  ],
};
