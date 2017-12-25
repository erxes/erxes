import React from 'react';
import { Route } from 'react-router-dom';
import queryString from 'query-string';
import { ChannelList } from './containers';

const routes = () => (
  <Route
    key="/channels"
    exact
    path="/channels"
    component={({ location }) => {
      return <ChannelList queryParams={queryString.parse(location.search)} />;
    }}
  />
);

export default routes;
