import Settings from './containers/Settings';

export default () => ({
  routes: [
    {
      path: '/settings',
      component: Settings
    }
  ],
  settings: [
    {
      name: 'POS',
      image: '/images/icons/erxes-05.svg',
      to: '/erxes-plugin-pos/settings/',
      action: 'posConfig',
      permissions: [],
    }
  ],
});
