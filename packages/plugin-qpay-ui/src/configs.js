module.exports = {
  name: 'qpay',
  port: 3019,
  exposes: {
    './routes': './src/routes.tsx'
  },
  routes: {
    url: 'http://localhost:3019/remoteEntry.js',
    scope: 'qpay',
    module: './routes'
  },
  menus: [
    {
      text: 'Qpay config',
      to: '/erxes-plugin-qpay/settings/',
      image: '/images/icons/erxes-16.svg',
      location: "settings",
      scope: "qpay",
      action: 'pluginQpayConfig',
      permissions: ['manageQr','allQr'],
    },
    {
      text: 'SocialPay config',
      to: '/erxes-plugin-qpay/settings_socialPay/',
      image: '/images/icons/erxes-16.svg',
      location: "settings",
      scope: "qpay",
      action: 'pluginQpayConfig',
      permissions: ['manageQr','allQr']

    }
  ]
};
