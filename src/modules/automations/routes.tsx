import asyncComponent from 'modules/common/components/AsyncComponent';
import * as React from 'react';
import { Route } from 'react-router-dom';

const AutomationList = asyncComponent(() =>
  import(/* webpackChunkName: "Automations" */ './containers/List')
);

const automationList = ({ location, history }) => {
  return <AutomationList history={history} />;
};

const routes = () => {
  return (
    <React.Fragment>
      <Route
        // key="automation"
        exact={true}
        path="/automation"
        component={automationList}
      />
    </React.Fragment>
  );
};

export default routes;
