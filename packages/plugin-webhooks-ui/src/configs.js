module.exports = {
  srcDir: __dirname,
  name: "webhooks",
  port: 3224,
  scope: "webhooks",
  exposes: {
    "./routes": "./src/routes.tsx",
    "./automation": "./src/automations/automations.tsx",
  },
  routes: {
    url: "http://localhost:3224/remoteEntry.js",
    scope: "webhooks",
    module: "./routes",
  },
  automation: "./automation",
  menus: [
    {
      text: "Outgoing webhooks",
      to: "/settings/webhooks",
      image: "/images/icons/erxes-11.svg",
      location: "settings",
      scope: "webhooks",
      action: "webhooksAll",
      permissions: ["showWebhooks"],
    },
  ],
};
