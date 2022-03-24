import Home from './containers/Home';

export default () => ({
  routes: [
    {
      path: '/home',
      component: Home
    }
  ],
  settings: [
    {
      name: 'Exm core config',
      image: '/images/icons/erxes-16.svg',
      to: '/erxes-plugin-exm-core/home',
      action: 'showExms',
      permissions: ['showExms']
    }
  ]
});
