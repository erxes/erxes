import React from 'react';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import { Route } from 'react-router-dom';

const Settings = asyncComponent(() =>
  import(
    /* webpackChunkName: 'Salesplans - Settings' */ './containers/Settings'
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
      path="/settings/sales-plans"
      key="/settings/sales-plans"
      exact={true}
      component={Settings}
    />
    <Route
      path="/settings/sales-plans/create"
      key="/settings/sales-plans/create"
      exact={true}
      component={CreatePlan}
    />
    <Route
      path="/settings/sales-plans/edit"
      key="/settings/sales-plans/edit"
      component={EditPlan}
    />
  </>
);

export default routes;
