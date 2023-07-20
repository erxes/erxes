import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const SyncSaas = asyncComponent(() =>
  import(/* webpackChunkName: "List - SyncSaas" */ './general/containers/List')
);

const syncsaas = ({ history, location }) => {
  return (
    <SyncSaas
      history={history}
      queryParams={queryString.parse(location.search)}
    />
  );
};

const routes = () => {
  return (
    <React.Fragment>
      <Route path="/sync-saas" exact component={syncsaas} />
    </React.Fragment>
  );
};

export default routes;
