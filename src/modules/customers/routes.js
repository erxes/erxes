import React from 'react';
import { Route } from 'react-router-dom';
import queryString from 'query-string';
import { MainLayout } from '../layout/components';
import { Main } from '../layout/styles';
import { ManageColumns } from '../fields/containers';
import { CustomersList, CustomerDetails } from './containers';

const routes = () => (
  <Main>
    <Route
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
    />

    <Route
      path="/customers/manage-columns"
      component={() => {
        return (
          <MainLayout content={<ManageColumns contentType="customer" />} />
        );
      }}
    />

    <Route
      path="/customers"
      component={({ location }) => {
        const queryParams = queryString.parse(location.search);
        return (
          <MainLayout content={<CustomersList queryParams={queryParams} />} />
        );
      }}
    />
  </Main>
);

export default routes;
