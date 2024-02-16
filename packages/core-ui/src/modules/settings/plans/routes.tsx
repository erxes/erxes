import * as React from 'react';
import { Route } from 'react-router-dom';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';

const PlansContainer = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Settings - PermissionList" */ './containers/Plans'
    ),
);

const plans = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);

  return <PlansContainer queryParams={queryParams} history={history} />;
};

const routes = () => (
  <>
    <Route
      key="/settings/organizations/"
      exact={true}
      path="/settings/organizations/"
      component={plans}
    />
  </>
);

export default routes;
