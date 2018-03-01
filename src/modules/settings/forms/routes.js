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
    key="/settings/forms/fields/manage/:contentType/:contentTypeId?"
    exact
    path="/settings/forms/fields/manage/:contentType/:contentTypeId?"
    component={({ match }) => {
      const { contentType, contentTypeId } = match.params;

      return <Manage contentType={contentType} contentTypeId={contentTypeId} />;
    }}
  />
];

export default routes;
