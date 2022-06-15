import React from 'react';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import { Route } from 'react-router-dom';

const SalesPlans = asyncComponent(() =>
  import(
    /* webpackChunkName: 'Salesplans - Settings' */ './containers/SalesPlans'
  )
);

const CreatePlan = asyncComponent(() =>
  import(
    /* webpackChunkName: 'Salesplans - Create' */ './containers/CreatePlan'
  )
);

const EditPlan = asyncComponent(() =>
  import(/* webpackChunkName: 'Salesplans - Edit' */ './containers/EditPlan')
);

const routes = () => (
  <>
    <Route
      path="/sales-plans"
      key="/sales-plans"
      exact={true}
      component={SalesPlans}
    />
    <Route
      path="/sales-plans/create"
      key="/sales-plans/create"
      exact={true}
      component={CreatePlan}
    />
    <Route
      path="/sales-plans/edit"
      key="/sales-plans/edit"
      component={EditPlan}
    />
  </>
);

export default routes;
