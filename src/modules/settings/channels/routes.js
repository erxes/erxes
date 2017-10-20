import React from 'react';
import { Route } from 'react-router-dom';
import { MainLayout } from '../../layout/components';
import { ChannelList, ChannelForm } from './containers';

const routes = () => (
  <div>
    <Route
      path='/settings/channels/'
      component={() => {
        return <MainLayout content={ <ChannelList queryParams={{}} /> } />
      }}
    />

    <Route
      path='/settings/channels/add'
      component={() => <MainLayout content={ <ChannelForm /> } /> }
    />

    <Route
      path='/settings/channels/:edit'
      component={() => <MainLayout content={ <ChannelForm /> } /> }
    />
  </div>
);

export default routes;
