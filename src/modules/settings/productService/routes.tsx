import queryString from 'query-string';
import * as React from 'react';
import { Route } from 'react-router-dom';
import { List } from './containers';

const productService = ({ location }) => {
  return <List queryParams={queryString.parse(location.search)} />;
};

const routes = () => (
  <Route path="/settings/product-service/" component={productService} />
);

export default routes;
