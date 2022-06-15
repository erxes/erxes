import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const ClientPortalDetail = asyncComponent(() =>
  import(
    /* webpackChunkName: "ClientPortalDetail - Settings" */ './containers/ClientPortalDetail'
  )
);

const ClientPortal = asyncComponent(() =>
  import(
    /* webpackChunkName: "ClientPortalDetail - Settings" */ './components/ClientPortal'
  )
);

const ClientPortalUserList = asyncComponent(() =>
  import(
    /* webpackChunkName: "ClientPortalDetail - Settings" */ './containers/ClientPortalUserList'
  )
);

const clientPortal = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);

  return <ClientPortal queryParams={queryParams} history={history} />;
};

const configsForm = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);

  return <ClientPortalDetail queryParams={queryParams} history={history} />;
};

const list = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);

  return <ClientPortalUserList queryParams={queryParams} history={history} />;
};

const routes = () => (
  <>
    <Route
      key="/settings/client-portal/"
      path="/settings/client-portal"
      exact={true}
      component={clientPortal}
    />
    <Route
      key="/settings/client-portal/form"
      path="/settings/client-portal/form"
      component={configsForm}
    />
    <Route
      key="/settings/client-portal/user"
      path="/settings/client-portal/user"
      component={list}
    />
  </>
);

export default routes;
