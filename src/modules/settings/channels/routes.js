import React from 'react';
import { Route } from 'react-router-dom';
import queryString from 'query-string';
import { MainLayout } from '../../layout/containers';
import { ChannelList } from './containers';

const routes = () => (
  <Route
    path="/settings/channels/"
    component={({ location }) => {
      return (
        <MainLayout
          content={
            <ChannelList queryParams={queryString.parse(location.search)} />
          }
        />
      );
    }}
  />
);

export default routes;
