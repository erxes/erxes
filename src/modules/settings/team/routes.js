import React from 'react';
import { Route } from 'react-router-dom';
import { MainLayout } from '../../layout/components';
import { UserList } from './containers';

const routes = () => (
  <div>
    <Route
      path='/settings/team/'
      component={() => {
        return <MainLayout content={ <UserList queryParams={{}} /> } />
      }}
    />
  </div>
);

export default routes;
