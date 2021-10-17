import React from 'react';
import List from './pos/containers/List';
import EditPos from './pos/containers/EditPos';
import queryString from 'query-string';

const settingsComponent = ({ location, history }) => {
  return (
    <List
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const editPos = ({ match, location }) => {
  const { integrationId } = match.params;
  const queryParams = queryString.parse(location.search);

  console.log("query: ",queryParams)

  return (
    <EditPos
      queryParams={queryParams}
      integrationId={integrationId}
    />
  );
}

export default () => ({
  routes: [
    {
      path: '/settings',
      component: settingsComponent
    },
    {
      path: '/pos/edit/:integrationId',
      component: editPos
    },
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
