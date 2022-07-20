module.exports = {
  name: 'webbuilder',
  port: 3012,
  scope: 'webbuilder',
  exposes: {
    './routes': './src/routes.tsx'
  },
  routes: {
    url: 'http://localhost:3012/remoteEntry.js',
    scope: 'webbuilder',
    module: './routes'
  },
  menus: [
    {
      text: "Web builder",
      url: "/webbuilder/pages",
      icon: "icon-car",
      location: "mainNavigation"
    },
    {
      text: "Content type",
      url: "/webbuilder/contenttypes",
      icon: "icon-book",
      location: "mainNavigation"
    },
    {
      text: "Entry",
      url: "/webbuilder/entries",
      icon: "icon-home",
      location: "mainNavigation"
    }
  ],
};