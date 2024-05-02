import { Route, Routes, useLocation, useParams } from 'react-router-dom';

import { Authorization } from './containers/Authorization';
import React from 'react';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';

const Store = asyncComponent(
  () => import(/* webpackChunkName: "Settings Store" */ './containers/Store'),
);

const CreateMessenger = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Settings CreateMessenger" */ './containers/messenger/Create'
    ),
);

const EditMessenger = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Settings EditMessenger" */ './containers/messenger/Edit'
    ),
);

const IntegrationConfigs = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Integration configs" */ '../integrationsConfig/containers/IntegrationConfigs'
    ),
);

const CreateMessengerComponent = () => {
  const location = useLocation();

  return <CreateMessenger queryParams={queryString.parse(location.search)} />;
};

const EditMessengerComponent = () => {
  const { _id } = useParams();

  return <EditMessenger integrationId={_id} />;
};

const StoreComponent = () => {
  const location = useLocation();

  return <Store queryParams={queryString.parse(location.search)} />;
};

const AuthComponent = () => {
  const location = useLocation();

  return <Authorization queryParams={queryString.parse(location.search)} />;
};

const routes = () => (
  <Routes>
    <Route
      key="/settings/integrations/createMessenger"
      path="/settings/integrations/createMessenger"
      element={<CreateMessengerComponent />}
    />

    <Route
      key="/settings/integrations/editMessenger/:_id"
      path="/settings/integrations/editMessenger/:_id"
      element={<EditMessengerComponent />}
    />

    <Route
      key="/settings/authorization"
      path="/settings/authorization"
      element={<AuthComponent />}
    />

    <Route
      key="/settings/integrations"
      path="/settings/integrations"
      element={<StoreComponent />}
    />
    <Route
      key="/settings/integrations-configs/"
      path="/settings/integrations-configs/"
      element={<IntegrationConfigs />}
    />
  </Routes>
);

export default routes;
