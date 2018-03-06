import React from 'react';
import { Route } from 'react-router-dom';
import queryString from 'query-string';
import { List } from './containers';
import { Form } from './components';

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
  />
];

export default routes;
