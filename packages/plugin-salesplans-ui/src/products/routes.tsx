import React from 'react';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import { Route } from 'react-router-dom';

const Products = asyncComponent(() =>
  import(
    /* webpackChunkName: 'Sales Plans - Products' */ './containers/Products'
  )
);

const routes = () => (
  <>
    <Route
      path="/sales-plans/products"
      key="/sales-plans/products"
      component={Products}
    />
  </>
);

export default routes;
