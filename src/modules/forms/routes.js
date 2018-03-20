import React from 'react';
import { Route } from 'react-router-dom';
import queryString from 'query-string';
import { List, Form } from './containers';

const routes = () => [
  <Route
    exact
    key="/forms"
    path="/forms"
    component={({ location }) => {
      const queryParams = queryString.parse(location.search);
      return <List queryParams={queryParams} />;
    }}
  />,

  <Route
    key="/forms/create"
    exact
    path="/forms/create"
    component={({ location }) => {
      const queryParams = queryString.parse(location.search);
      return <Form queryParams={queryParams} />;
    }}
  />,

  <Route
    key="/forms/edit/:contentTypeId?"
    exact
    path="/forms/edit/:contentTypeId?"
    component={({ match }) => {
      const { contentTypeId } = match.params;
      return <Form contentTypeId={contentTypeId} />;
    }}
  />
];

export default routes;
