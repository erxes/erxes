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
      text: "Golomt Bank config",
      image: "/images/icons/erxes-01.svg",
      to: "/erxes-plugin-golomtbank/config",
      scope: 'golomtbank',
      location: "settings"
    },
    {
      text: "GolomtBank",
      icon: "icon-university",
      url: "/erxes-plugin-golomtbank/accounts",
      scope: 'golomtbank',
      location: "mainNavigation"
    }
  ]
};
