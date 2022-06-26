import React from 'react';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import { Route } from 'react-router-dom';

const SalesPlans = asyncComponent(() =>
  import(/* webpackChunkName: 'Sales Plans' */ './containers/SalesPlans')
);

const routes = () => (
  <>
    <Route
      path="/sales-plans"
      key="/sales-plans"
      exact={true}
      component={SalesPlans}
    />
  </>
);

export default routes;
