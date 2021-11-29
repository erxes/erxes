import Home from './containers/Home';

export default () => ({
  routes: [
    {
      path: '/home',
      component: Home
    }
  ],
  menu: {
    label: 'Exm core',
    icon: 'icon-cog',
    link: '/home',
    permission: 'showExmCore'
  }
});
