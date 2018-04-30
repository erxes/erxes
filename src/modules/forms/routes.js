import React from 'react';
import { Route } from 'react-router-dom';
import queryString from 'query-string';
import { List, EditForm, CreateForm } from './containers';

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
    component={CreateForm}
  />,

  <Route
    key="/forms/edit/:contentTypeId?/:formId?"
    exact
    path="/forms/edit/:contentTypeId/:formId"
    component={({ match }) => {
      const { contentTypeId, formId } = match.params;
      return <EditForm contentTypeId={contentTypeId} formId={formId} />;
    }}
  />
];

export default routes;
