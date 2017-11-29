import React from 'react';
import { Route } from 'react-router-dom';
import queryString from 'query-string';
import { BrandList } from './containers';

const routes = () => (
  <Route
    path="/settings/brands/"
    component={({ location }) => {
      return <BrandList queryParams={queryString.parse(location.search)} />;
    }}
  />
);

export default routes;
