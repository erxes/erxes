import React from 'react';
import { Route } from 'react-router-dom';
import queryString from 'query-string';
import { List, Manage } from './containers';

const routes = () => [
  <Route
    key="/settings/forms/"
    exact
    path="/settings/forms/"
    component={({ location }) => {
      return <List queryParams={queryString.parse(location.search)} />;
    }}
  />,
  <Route
    key="/settings/forms/fieldsmanage/:contentTypeId?"
    exact
    path="/settings/forms/fields/manage/:contentTypeId?"
    component={({ match }) => {
      const { contentTypeId } = match.params;

      return <Manage contentTypeId={contentTypeId} />;
    }}
  />
];

export default routes;
