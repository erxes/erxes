import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import queryString from 'query-string';
import { ChannelList } from './containers';

const routes = () => [
  <Route
    exact
    key="/settings"
    path="/settings"
    render={() => <Redirect to="/settings/channels/" />}
  />,

  <Route
    key="/settings/channels"
    path="/settings/channels"
    component={({ location }) => {
      return <ChannelList queryParams={queryString.parse(location.search)} />;
    }}
  />
];

export default routes;
