import React from 'react';
import { Route } from 'react-router-dom';
import { MainLayout } from '../layout/components';
import { Manage } from '../fields/containers';

const routes = () => (
  <div>
    <Route
      path="/fields/manage/:contentType"
      component={({ match }) => {
        const contentType = match.params.contentType;

        return <MainLayout content={<Manage contentType={contentType} />} />;
      }}
    />
  </div>
);

export default routes;
