import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';
import { Authorization } from './containers/Authorization';

const Store = asyncComponent(() =>
  import(/* webpackChunkName: "Settings Store" */ './containers/Store')
);

const CreateMessenger = asyncComponent(() =>
  import(
    /* webpackChunkName: "Settings CreateMessenger" */ './containers/messenger/Create'
  )
);

const EditMessenger = asyncComponent(() =>
  import(
    /* webpackChunkName: "Settings EditMessenger" */ './containers/messenger/Edit'
  )
);

const IntegrationConfigs = asyncComponent(() =>
  import(
    /* webpackChunkName: "Integration configs" */ '../integrationsConfig/containers/IntegrationConfigs'
  )
);

const createMessenger = ({ location }) => {
  return <CreateMessenger queryParams={queryString.parse(location.search)} />;
};

const editMessenger = ({ match }) => {
  return <EditMessenger integrationId={match.params._id} />;
};

const store = ({ location }) => (
  <Store queryParams={queryString.parse(location.search)} />
);

const auth = ({ location }) => (
  <Authorization queryParams={queryString.parse(location.search)} />
);

const routes = () => (
  <React.Fragment>
    <Route
      key="/settings/integrations/createMessenger"
      exact={true}
      path="/settings/integrations/createMessenger"
      component={createMessenger}
    />

    <Route
      key="/settings/integrations/editMessenger/:_id"
      exact={true}
      path="/settings/integrations/editMessenger/:_id"
      component={editMessenger}
    />

    <Route
      key="/settings/authorization"
      exact={true}
      path="/settings/authorization"
      component={auth}
    />

    <Route
      key="/settings/integrations"
      exact={true}
      path="/settings/integrations"
      component={store}
    />
    <Route
      key="/settings/integrations-configs/"
      exact={true}
      path="/settings/integrations-configs/"
      component={IntegrationConfigs}
    />
  </React.Fragment>
);

export default routes;
