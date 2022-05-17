module.exports = {
  name: "salesplans",
  port: 3025,
  exposes: {},
  routes: {
    url: "http://localhost:3021/remoteEntry.js",
    scope: "salesplans",
    module: "./routes",
  },
  menus: [
    {
      text: "Salesplans",
      to: "/erxes-plugin-jurur-cake/settings/",
      image: "/images/icons/erxes-05.svg",
      location: "settings",
      scope: "salesplans",
      action: "",
      permissions: [],
    },
  ],
};
