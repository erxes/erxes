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

const ClientPortalUserDetails = asyncComponent(() =>
  import(
    /* webpackChunkName: "ClientPortalDetails" */ './containers/details/ClientPortalUserDetails'
  )
);

const ClientPortalCompanyDetails = asyncComponent(() =>
  import(
    /* webpackChunkName: "ClientPortalDetails" */ './containers/details/ClientPortalCompanyDetails'
  )
);

const ClientPortalUserList = asyncComponent(() =>
  import(
    /* webpackChunkName: "ClientPortalUserList - Settings" */ './containers/ClientPortalUserList'
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

const userDetail = ({ match, location, history }) => {
  const id = match.params.id;

  const queryParams = queryString.parse(location.search);
  return (
    <ClientPortalUserDetails
      id={id}
      history={history}
      queryParams={queryParams}
    />
  );
};

const companyDetail = ({ match, history }) => {
  const id = match.params.id;

  return <ClientPortalCompanyDetails id={id} history={history} />;
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
      key="/settings/client-portal/users/details/:id"
      exact={true}
      path="/settings/client-portal/users/details/:id"
      component={userDetail}
    />
    <Route
      key="/settings/client-portal/companies/details/:id"
      exact={true}
      path="/settings/client-portal/companies/details/:id"
      component={companyDetail}
    />
    <Route
      key="/settings/client-portal/user"
      path="/settings/client-portal/user"
      component={list}
    />
  </>
);

export default routes;
