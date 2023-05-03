module.exports = {
  name: 'calls',
  port: 3017,
  scope: 'calls',
  exposes: {
    './routes': './src/routes.tsx',
    './nav': './src/containers/Widget.tsx',
  },
  routes: {
    url: 'http://localhost:3017/remoteEntry.js',
    scope: 'calls',
    module: './routes'
  },
  menus:[
    {
      text: "Calls",
      url: "/calls",
      icon: "icon-outgoing-call",
      location: "topNavigation",
      scope: "calls",
      component: "./nav",
    }
  ]
};
