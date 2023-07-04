import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const AccountList = asyncComponent(() =>
  import(
    /* webpackChunkName: "Settings List - AccountService" */ './containers/account/AccountList'
  )
);

const AccountDetails = asyncComponent(() =>
  import(
    /* webpackChunkName: "Settings List - AccountService" */ './containers/account/detail/AccountDetails'
  )
);

const details = ({ match }) => {
  const id = match.params.id;

  return <AccountDetails id={id} />;
};

const accountService = ({ location, history }) => {
  return (
    <AccountList
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const routes = () => (
  <React.Fragment>
    <Route
      path="/settings/account/details/:id"
      exact={true}
      key="/settings/account/details/:id"
      component={details}
    />

    <Route
      path="/settings/account/"
      exact={true}
      key="/settings/account/"
      component={accountService}
    />
  </React.Fragment>
);

export default routes;
