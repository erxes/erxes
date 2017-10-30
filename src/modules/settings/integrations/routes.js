import React from 'react';
import { Route } from 'react-router-dom';
import queryString from 'query-string';
import { MainLayout } from '../../layout/containers';
import { List, MessengerAppearance, MessengerConfigs } from './containers';

const routes = () => [
  <Route
    key="/settings/integrations/messenger/configs/:integrationId"
    exact
    path="/settings/integrations/messenger/configs/:integrationId"
    component={({ match }) => {
      const id = match.params.integrationId;
      return <MainLayout content={<MessengerConfigs integrationId={id} />} />;
    }}
  />,

  <Route
    key="/settings/integrations/messenger/appearance/:integrationId"
    exact
    path="/settings/integrations/messenger/appearance/:integrationId"
    component={({ match }) => {
      const id = match.params.integrationId;
      return (
        <MainLayout content={<MessengerAppearance integrationId={id} />} />
      );
    }}
  />,

  <Route
    key="/settings/integrations"
    exact
    path="/settings/integrations"
    component={({ location }) => {
      return (
        <MainLayout
          content={<List queryParams={queryString.parse(location.search)} />}
        />
      );
    }}
  />
];

export default routes;
