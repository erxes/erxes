import React from 'react';
import { Route } from 'react-router-dom';
import { MainLayout } from '../../layout/components';
import { List, Signature } from './containers';

const routes = () => (
  <div>
    <Route
      path="/settings/emails/"
      component={() => {
        return <MainLayout content={<List queryParams={{}} />} />;
      }}
    />

    <Route
      path="/settings/emails/signatures"
      component={() => {
        return <MainLayout content={<Signature queryParams={{}} />} />;
      }}
    />
  </div>
);

export default routes;
