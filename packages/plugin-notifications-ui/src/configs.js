module.exports = {
  name: "notifications",
  port: 3014,
  exposes: {
    "./routes": "./src/routes.tsx",
    "./settings": "./src/containers/Widget.tsx",
  },
  routes: {
    url: "http://localhost:3014/remoteEntry.js",
    scope: "notifications",
    module: "./routes",
  },
  menus: [
    {
      text: "notifications",
      url: "/notifications",
      icon: "icon-book-open",
      location: "topNavigation",
      scope: "notifications",
      component: "./settings",
    },
    {
      text: "Notification settings",
      to: "/settings/notifications",
      image: "/images/icons/erxes-11.svg",
      location: "settings",
      scope: "notifications"
    },
  ],
};
