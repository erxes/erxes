import React from 'react';
import { Route } from 'react-router-dom';
import queryString from 'query-string';
import { MainLayout } from '../../layout/components';
import { List } from './containers';
import { AddIntegration } from './components';

const routes = () => (
  <div>
    <Route
      path="/settings/integrations/add"
      component={() => {
        return <MainLayout content={<AddIntegration />} />;
      }}
    />

    <Route
      path="/settings/integrations"
      component={({ location }) => {
        return (
          <MainLayout
            content={<List queryParams={queryString.parse(location.search)} />}
          />
        );
      }}
    />
  </div>
);

export default routes;
