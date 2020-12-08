import asyncComponent from 'modules/common/components/AsyncComponent';
import React from 'react';
import { Route } from 'react-router-dom';

const Status = asyncComponent(() =>
  import(/* webpackChunkName: "Settings Status" */ './containers/Status')
);

const ReleaseInfo = asyncComponent(() =>
  import(
    /* webpackChunkName: "Settings ReleaseInfo" */ './containers/ReleaseInfo'
  )
);

const routes = () => (
  <React.Fragment>
    <Route exact={true} path="/settings/status/" component={Status} />
    <Route
      exact={true}
      path="/settings/release-info/"
      component={ReleaseInfo}
    />
  </React.Fragment>
);

export default routes;
