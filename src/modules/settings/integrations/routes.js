import React from 'react';
import { Route } from 'react-router-dom';
import queryString from 'query-string';
import { MainLayout } from '../../layout/containers';
import {
  List,
  Twitter,
  MessengerAppearance,
  MessengerConfigs
} from './containers';

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
    key="/settings/integrations/twitter"
    exact
    path="/settings/integrations/twitter"
    component={() => <MainLayout content={<Twitter type="link" />} />}
  />,

  <Route
    key="/service/oauth/twitter_callback"
    exact
    path="/service/oauth/twitter_callback"
    component={({ history, location }) => {
      const queryParams = queryString.parse(location.search);

      return (
        <MainLayout
          content={
            <Twitter type="form" history={history} queryParams={queryParams} />
          }
        />
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
