import React from 'react';
import { Route } from 'react-router-dom';
import queryString from 'query-string';
import { MainLayout } from '../../layout/containers';
import { List, MessengerAppearance, MessengerConfigs } from './containers';
import { AddIntegration } from './components';

const routes = () => [
  <Route
    key="/settings/integrations/messenger/configs/:integrationId"
    path="/settings/integrations/messenger/configs/:integrationId"
    component={({ match }) => {
      const id = match.params.integrationId;
      return <MainLayout content={<MessengerConfigs integrationId={id} />} />;
    }}
  />,

  <Route
    key="/settings/integrations/messenger/appearance/:integrationId"
    path="/settings/integrations/messenger/appearance/:integrationId"
    component={({ match }) => {
      const id = match.params.integrationId;
      return (
        <MainLayout content={<MessengerAppearance integrationId={id} />} />
      );
    }}
  />,

  <Route
    key="/settings/integrations/add"
    path="/settings/integrations/add"
    component={() => {
      return <MainLayout content={<AddIntegration />} />;
    }}
  />,

  <Route
    key="/settings/integrations"
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
