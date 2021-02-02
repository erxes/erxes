import asyncComponent from 'modules/common/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const List = asyncComponent(() =>
  import(
    /* webpackChunkName: "ClientPortalList  - Settings" */ './containers/List'
  )
);

const ClientPortalForm = asyncComponent(() =>
  import(
    /* webpackChunkName: "ClientPortalForm - Settings" */ './containers/ClientPortal'
  )
);

const configsList = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);

  return <List queryParams={queryParams} history={history} />;
};

const configsForm = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);

  return <ClientPortalForm queryParams={queryParams} history={history} />;
};

const routes = () => (
  <>
    <Route
      key="/settings/client-portal/"
      path="/settings/client-portal/configs"
      component={configsList}
    />
    ,
    <Route
      key="/settings/client-portal/form"
      path="/settings/client-portal/form"
      component={configsForm}
    />
  </>
);

export default routes;
