import asyncComponent from 'modules/common/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const List = asyncComponent(() =>
  import(/* webpackChunkName: "Settings - List Email" */ './containers/List')
);

const Signature = asyncComponent(() =>
  import(/* webpackChunkName: "Settings - Signature Email" */ './containers/Signature')
);

const emailSignatures = ({ location }) => {
  return <Signature queryParams={queryString.parse(location.search)} />;
};

const routes = () => (
  <React.Fragment>
    <Route
      key="/settings/emails/"
      exact={true}
      path="/settings/emails/"
      component={List}
    />

    <Route
      key="/settings/emails/signatures"
      exact={true}
      path="/settings/emails/signatures"
      component={emailSignatures}
    />
  </React.Fragment>
);

export default routes;
