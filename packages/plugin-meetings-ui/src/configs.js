module.exports = {
  name: 'meetings',
  port: 3017,
  scope: 'meetings',
  exposes: {
    './routes': './src/routes.tsx'
  },
  routes: {
    url: 'http://localhost:3017/remoteEntry.js',
    scope: 'meetings',
    module: './routes'
  },
  menus:[{"text":"Meetingss","url":"/meetingss","icon":"icon-star","location":"mainNavigation"}]
};
