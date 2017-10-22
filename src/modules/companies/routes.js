import React from 'react';
import { Route } from 'react-router-dom';
import queryString from 'query-string';
import { MainLayout } from '../layout/components';
import { Main } from '../layout/styles';
import { ManageColumns } from '../fields/containers';
import { CompaniesList, CompanyDetails } from './containers';

const routes = () => (
  <Main>
    <Route
      path="/companies/details/:id"
      component={({ match, location }) => {
        const queryParams = queryString.parse(location.search);
        const id = match.params.id;

        return (
          <MainLayout
            content={<CompanyDetails id={id} queryParams={queryParams} />}
          />
        );
      }}
    />

    <Route
      path="/companies/manage-columns"
      component={() => {
        return <MainLayout content={<ManageColumns contentType="company" />} />;
      }}
    />

    <Route
      path="/companies"
      component={({ location }) => {
        const queryParams = queryString.parse(location.search);
        return (
          <MainLayout content={<CompaniesList queryParams={queryParams} />} />
        );
      }}
    />
  </Main>
);

export default routes;
