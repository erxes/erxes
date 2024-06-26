module.exports = {
  srcDir: __dirname,
  name: 'golomtbank',
  scope: 'golomtbank',
  port: 3024,
  exposes: {
    './routes': './src/routes.tsx'
  },
  routes: {
    url: 'http://localhost:3024/remoteEntry.js',
    scope: 'golomtbank',
    module: './routes'
  },
  menus: [
    {
      text: "GolomtBank",
      to: "/settings/golomtBank",
      image: "/images/icons/erxes-25.png",
      location: "settings",
      scope: "golomtBank",
    },
    {
      text: "GolomtBank",
      url: "/golomtBank-corporate-gateway",
      icon: "icon-university",
      location: "mainNavigation",
      scope: "golomtBank"
    },
  ]
};
