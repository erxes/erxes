// import { getEnv } from 'apolloClient';
import asyncComponent from 'modules/common/components/AsyncComponent';
import * as React from 'react';
import { Route } from 'react-router-dom';

const AutomationList = asyncComponent(() =>
  import(/* webpackChunkName: "Automations" */ './containers/List')
);

const automationList = ({ location }) => {
  // const { REACT_APP_API_AUTOMATION_URL } = getEnv();
  // const url = `${REACT_APP_API_AUTOMATION_URL}/graphql`;

  return <AutomationList apiPath={ 'url' } />;
};

const routes = () => {
  return (
    <React.Fragment>
      <Route
        key="automations"
        exact={true}
        path="/automations"
        component={automationList}
      />
    </React.Fragment>
  );
};

export default routes;
