import Settings from './containers/Settings';
import SPSettings from './containers/SPSettings';
// import QpaySection from './components/common/QpaySection'

export default () => ({
  routes: [
    {
      path: '/settings',
      component: Settings
    },
    {
      path: '/settings_socialPay',
      component: SPSettings
    }
  ],
  settings: [
    {
      name: 'Qpay config',
      image: '/images/icons/erxes-16.svg',
      to: '/erxes-plugin-qpay/settings/',
      action: 'pluginQpayConfig',
      permissions: []
    },
    {
      name: 'SocialPay config',
      image: '/images/icons/erxes-16.svg',
      to: '/erxes-plugin-qpay/settings_socialPay/',
      action: 'pluginQpayConfig',
      permissions: []
    }
  ]
  // ,customerRightSidebarSection: {
  //   section: QpaySection,
  // },
});
