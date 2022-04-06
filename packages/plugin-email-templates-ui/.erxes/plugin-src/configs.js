module.exports = {
  name: "emailTemplates",
  port: 3020,
  exposes: {
    "./routes": "./src/routes.tsx",
  },
  routes: {
    url: "http://localhost:3020/remoteEntry.js",
    scope: "emailTemplates",
    module: "./routes",
  },
  menus: [
    {
      text: "Email Templates",
      to: "/settings/email-templates",
      image: "/images/icons/erxes-09.svg",
      location: "settings",
      scope: "emailTemplates",
      action: "",
      permissions: [],
    },
  ],
};
