window.plugins = [
  {
    name: "tags",
    exposes: { "./routes": "./src/routes.tsx" },
    routes: {
      url: "https://office.erxes.io/js/plugins/plugin-tags-ui/remoteEntry.js",
      scope: "tags",
      module: "./routes",
    },
    menus: [
      {
        text: "Tags",
        url: "/tags",
        icon: "icon-tag-alt",
        location: "mainNavigation",
        permission: "showTags",
      },
    ],
  },
];
