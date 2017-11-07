import React from 'react';
import { Route } from 'react-router-dom';
import queryString from 'query-string';
import { MainLayout } from '../../layout/containers';
import { List, Signature } from './containers';

const routes = () => [
  <Route
    key="/settings/emails/"
    exact
    path="/settings/emails/"
    component={({ location }) => {
      return (
        <MainLayout
          content={<List queryParams={queryString.parse(location.search)} />}
        />
      );
    }}
  />,

  <Route
    key="/settings/emails/signatures"
    exact
    path="/settings/emails/signatures"
    component={({ location }) => {
      return (
        <MainLayout
          content={
            <Signature queryParams={queryString.parse(location.search)} />
          }
        />
      );
    }}
  />
];

export default routes;
