module.exports = {
  name: 'assets',
  port: 3012,
  scope: 'assets',
  exposes: {
    './routes': './src/routes.tsx'
  },
  routes: {
    url: 'http://localhost:3012/remoteEntry.js',
    scope: 'assets',
    module: './routes'
  },
  menus: [
    {
      text: 'Assets',
      to: '/settings/assets/',
      image: '/images/icons/erxes-18.svg',
      location: 'settings',
      scope: 'assets'
    },
    {
      text: 'Asset & Movements',
      url: '/asset-movements',
      icon: 'icon-piggybank',
      location: 'mainNavigation'
    }
  ]
};
