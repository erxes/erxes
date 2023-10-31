module.exports = {
  name: 'goalType',
  port: 3017,
  scope: 'goalType',
  exposes: {
    './routes': './src/routes.tsx'
  },
  routes: {
    url: 'http://localhost:3017/remoteEntry.js',
    scope: 'goalType',
    module: './routes'
  },
  menus: [
    {
      text: 'Goals',
      to: '/erxes-plugin-goalType/goalType',
      image: '/images/icons/erxes-18.svg',
      location: 'settings',
      scope: 'goalType'
    }
  ]
};

// module.exports = {
//   name: 'goalType',
//   port: 3017,
//   scope: 'goalType',
//   exposes: {
//     './routes': './src/routes.tsx'
//   },
//   routes: {
//     url: 'http://localhost:3017/remoteEntry.js',
//     scope: 'goalType',
//     module: './routes'
//   },
//   menus: [
//     {
//       text: 'Goals',
//       to: '/goals',
//       image: '/images/icons/erxes-18.svg',
//       location: 'settings',
//       scope: 'goalType'
//     }
//   ]
// };
