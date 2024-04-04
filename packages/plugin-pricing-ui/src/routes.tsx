import React from 'react';
import { Route } from 'react-router-dom';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';

const plans = asyncComponent(() =>
  import(/* webpackChunkName: "Settings List - Pricing" */ './page/Plans')
);

const planCreate = asyncComponent(() =>
  import(
    /* webpackChunkName: "Settings List - Pricing - Create Discount" */ './page/PlanCreate'
  )
);

const planEdit = asyncComponent(() =>
  import(
    /* webpackChunkName: "Settings List - Pricing - Edit Discount" */ './page/PlanEdit'
  )
);

const routes = () => {
  return (
    <React.Fragment>
      <Route
        exact={true}
        path="/pricing/plans"
        key="/pricing/plans"
        component={plans}
      />

      <Route
        exact={true}
        path="/pricing/plans/create"
        key="/pricing/plans/create"
        component={planCreate}
      />

      <Route
        exact={true}
        path="/pricing/plans/edit/:id"
        key="/pricing/plans/edit/"
        component={planEdit}
      />
    </React.Fragment>
  );
};

export default routes;
