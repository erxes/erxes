import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import React from 'react';
import { Route } from 'react-router-dom';
import queryString from 'query-string';

const GrantRequest = asyncComponent(() =>
  import(/* webpackChunkName: "List - Request" */ './requests/containers/List')
);

const requests = ({ history, location }) => {
  return (
    <GrantRequest
      history={history}
      queryParams={queryString.parse(location.search)}
    />
  );
};

const routes = () => {
  return (
    <React.Fragment>
      <Route path="/grants/requests" exact component={requests} />
    </React.Fragment>
  );
};

export default routes;
