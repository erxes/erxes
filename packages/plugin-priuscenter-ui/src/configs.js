module.exports = {
  name: 'priuscenter',
  port: 3017,
  scope: 'priuscenter',
  exposes: {
    './routes': './src/routes.tsx'
  },
  routes: {
    url: 'http://localhost:3017/remoteEntry.js',
    scope: 'priuscenter',
    module: './routes'
  },
  menus:[{"text":"Ads","url":"/ads","icon":"icon-star","location":"mainNavigation"}]
};