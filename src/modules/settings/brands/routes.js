import React from 'react';
import { Route } from 'react-router-dom';
import queryString from 'query-string';
import { MainLayout } from '../../layout/containers';
import { BrandList } from './containers';

const routes = () => (
  <Route
    path="/settings/brands/"
    component={({ location }) => {
      return (
        <MainLayout
          content={
            <BrandList queryParams={queryString.parse(location.search)} />
          }
        />
      );
    }}
  />
);

export default routes;
