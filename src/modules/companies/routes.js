import React from 'react';
import { Route } from 'react-router-dom';
import queryString from 'query-string';
import { MainLayout } from '../layout/containers';
import { CompaniesList, CompanyDetails } from './containers';

const routes = () => [
  <Route
    path="/companies/details/:id"
    exact
    key="/companies/details/:id"
    component={({ match, location }) => {
      const queryParams = queryString.parse(location.search);
      const id = match.params.id;

      return (
        <MainLayout
          content={<CompanyDetails id={id} queryParams={queryParams} />}
        />
      );
    }}
  />,

  <Route
    path="/companies"
    exact
    key="/companies"
    component={({ location }) => {
      const queryParams = queryString.parse(location.search);
      return (
        <MainLayout content={<CompaniesList queryParams={queryParams} />} />
      );
    }}
  />
];

export default routes;
