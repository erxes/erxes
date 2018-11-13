import queryString from 'query-string';
import * as React from 'react';
import { Route } from 'react-router-dom';
import { List, Signature } from './containers';

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
