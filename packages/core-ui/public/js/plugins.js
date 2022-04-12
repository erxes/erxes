window.plugins = [
  {
    name: "contacts",
    port: 3011,
    exposes: { "./routes": "./src/routes.tsx" },
    routes: {
      url: "http://localhost:3011/remoteEntry.js",
      scope: "contacts",
      module: "./routes",
    },
    menus: [
      {
        text: "Contacts",
        url: "/contacts/customer",
        icon: "icon-users",
        location: "mainNavigation",
        permission: "showCustomers",
      },
    ],
  },
  {
    name: "products",
    port: 3022,
    exposes: { "./routes": "./src/routes.tsx" },
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
    ],
  },
  {
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
        to: "/tags/inbox:conversation",
        image: "/images/icons/erxes-18.svg",
        location: "settings",
        scope: "tags",
        action: "tagsAll",
        permissions: ["showTags", "manageTags"],
      },
    ],
  },
  {
    name: "pos",
    port: 3016,
    exposes: {
      "./routes": "./src/routes.tsx",

    },
    routes: {
      url: "http://localhost:3016/remoteEntry.js",
      scope: "pos",
      module: "./routes",
    },
    menus: [
      {
        text: "POS",
        to: "/pos",
        image: "/images/icons/erxes-05.svg",
        location: "settings",
        scope: "pos",
        action: "posConfig",
        permissions: ['showPos'],
      },
    ],
  }

];
