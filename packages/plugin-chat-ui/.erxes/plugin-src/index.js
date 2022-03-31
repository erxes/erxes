import React from 'react';
import queryString from 'query-string';
import Home from './containers/Home';

const home = ({ location }) => {
  return <Home queryParams={queryString.parse(location.search)} />;
};

export default () => ({
  routes: [
    {
      path: '/home',
      component: home,
    },
  ],
  menu: {
    label: 'Chat',
    icon: 'icon-chat',
    link: '/home',
    permission: 'showChats',
  },
});
