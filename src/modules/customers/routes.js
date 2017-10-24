import React from 'react';
import { Route } from 'react-router-dom';
import queryString from 'query-string';
import { MainLayout } from '../layout/containers';
import { ManageColumns } from '../fields/containers';
import { CustomersList, CustomerDetails } from './containers';

const routes = () => [
  <Route
    key="/customers/details/:id"
    path="/customers/details/:id"
    component={({ match, location }) => {
      const queryParams = queryString.parse(location.search);
      const id = match.params.id;

      return (
        <MainLayout
          content={<CustomerDetails id={id} queryParams={queryParams} />}
        />
      );
    }}
  />,

  <Route
    key="/customers/manage-columns"
    path="/customers/manage-columns"
    component={() => {
      return <MainLayout content={<ManageColumns contentType="customer" />} />;
    }}
  />,

  <Route
    key="/customers"
    path="/customers"
    component={({ location }) => {
      const queryParams = queryString.parse(location.search);
      return (
        <MainLayout content={<CustomersList queryParams={queryParams} />} />
      );
    }}
  />
];

export default routes;
