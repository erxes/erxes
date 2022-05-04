module.exports = {
  name: "emailtemplates",
  port: 3020,
  exposes: {
    "./routes": "./src/routes.tsx",
  },
  routes: {
    url: "http://localhost:3020/remoteEntry.js",
    scope: "emailtemplates",
    module: "./routes",
  },
  menus: [
    {
      text: "Email Templates",
      to: "/settings/email-templates",
      image: "/images/icons/erxes-09.svg",
      location: "settings",
      scope: "emailtemplates",
      action: "",
      permissions: [],
    },
  ],
};
