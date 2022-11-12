import React from 'react';
import { Route } from 'react-router-dom';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';

const products = asyncComponent(() =>
  import(
    /* webpackChunkName: 'Sales Plans - Products' */ './products/components/Products'
  )
);

const salesplans = asyncComponent(() =>
  import(
    /* webpackChunkName: 'Sales Plans' */ './salesplans/containers/SalesPlans'
  )
);

const LabelConfigs = asyncComponent(() =>
  import(/* webpackChunkName: 'Sales Plans' */ './settings/containers/List')
);

const labelsList = ({ location, history }) => {
  return (
    <LabelConfigs
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const routes = () => {
  return (
    <>
      <Route
        exact={true}
        path="/salesplans/labels"
        key="/salesplans/labels"
        component={labelsList}
      />
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
