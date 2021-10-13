import React from 'react';
import Settings from './containers/Settings';
import queryString from 'query-string';

const SettingsComponent = ({ location, history }) => {
  return (
    <Settings
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

export default () => ({
  routes: [
    {
      path: '/settings',
      component: SettingsComponent
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
