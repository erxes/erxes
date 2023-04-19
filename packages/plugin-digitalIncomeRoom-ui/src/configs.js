module.exports = {
  name: 'digitalIncomeRoom',
  port: 3017,
  scope: 'digitalIncomeRoom',
  exposes: {
    './routes': './src/routes.tsx'
  },

  routes: {
    url: 'http://localhost:3017/remoteEntry.js',
    scope: 'digitalIncomeRoom',
    module: './routes'
  },
  menus:[{"text":"DigitalIncomeRooms","to":"/digitalIncomeRooms","image":"/images/icons/erxes-18.svg","location":"settings","scope":"digitalIncomeRoom"}]
};


// module.exports = {
//   name: "digitalIncomeRoom",
//   port: 3017,
//   exposes: {
//     "./routes": "./src/routes.tsx",
//   },
//   routes: {
//     url: "http://localhost:3027/remoteEntry.js",
//     scope: "digitalIncomeRoom",
//     module: "./routes",
//   },
//   menus: [
//     {
//       text: "digital Income Room",
//       url: "/digitalIncomeRoom",
//       icon: "/images/icons/erxes-18.svg",
//       location: "mainNavigation",
//       permission: "showdigitalIncomeRoom",
//     },
//   ],
// };
