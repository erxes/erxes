module.exports = {
  name: 'calls',
  port: 3017,
  scope: 'calls',
  exposes: {
    './routes': './src/routes.tsx',
    './call': './src/containers/Widget.tsx',
    './incomin-call': './src/containers/IncomingCall.tsx',
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
      component: "./call",
    },
    {
      text: "Incoming calls",
      icon: "icon-outgoing-call",
      location: "topNavigation",
      scope: "calls",
      component: "./incomin-call",
    }
  ]
};
