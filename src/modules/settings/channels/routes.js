import React from 'react';
import { Route } from 'react-router-dom';
import { MainLayout } from '../../layout/containers';
import { ChannelList } from './containers';

const routes = () => (
  <Route
    path="/settings/channels/"
    component={() => {
      return <MainLayout content={<ChannelList queryParams={{}} />} />;
    }}
  />
);

export default routes;
