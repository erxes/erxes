module.exports = {
  name: 'goal',
  port: 3017,
  scope: 'goal',
  exposes: {
    './routes': './src/routes.tsx'
  },
  routes: {
    url: 'http://localhost:3017/remoteEntry.js',
    scope: 'goal',
    module: './routes'
  },
  menus: [
    {
      text: 'Goals',
      to: '/erxes-plugin-goal/goal-types',
      image: '/images/icons/erxes-18.svg',
      location: 'settings',
      scope: 'goal'
    }
  ]
};

// module.exports = {
//   name: 'goal',
//   port: 3017,
//   scope: 'goal',
//   exposes: {
//     './routes': './src/routes.tsx'
//   },
//   routes: {
//     url: 'http://localhost:3017/remoteEntry.js',
//     scope: 'goal',
//     module: './routes'
//   },
//   menus: [
//     {
//       text: 'Goals',
//       to: '/goals',
//       image: '/images/icons/erxes-18.svg',
//       location: 'settings',
//       scope: 'goal'
//     }
//   ]
// };
