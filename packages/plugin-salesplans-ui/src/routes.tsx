import React from 'react';
import { Route } from 'react-router-dom';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';

const products = asyncComponent(() =>
  import(
    /* webpackChunkName: 'Sales Plans - Products' */ './products/containers/Products'
  )
);

const salesplans = asyncComponent(() =>
  import(
    /* webpackChunkName: 'Sales Plans' */ './salesplans/containers/SalesPlans'
  )
);

const routes = () => {
  return (
    <>
      <Route
        exact={true}
        path="/sales-plans"
        key="/sales-plans"
        component={salesplans}
      />
      <Route
        exact={true}
        path="/sales-plans/products"
        key="/sales-plans/products"
        component={products}
      />
    </>
  );
};

export default routes;
