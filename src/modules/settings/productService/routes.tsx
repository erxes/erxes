import queryString from 'query-string';
import * as React from 'react';
import { Route } from 'react-router-dom';
import { List } from './containers';

const routes = () => {
  const productService = ({ location }) => {
    return <List queryParams={queryString.parse(location.search)} />;
  };

  return <Route path="/settings/product-service/" component={productService} />;
};

export default routes;
