import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const SyncSaas = asyncComponent(() =>
  import(/* webpackChunkName: "List - SyncSaas" */ './general/containers/List')
);

const Detail = asyncComponent(() =>
  import(/* webpackChunkName: "List - SyncSaas" */ './general/containers/Form')
);

const syncsaas = ({ history, location }) => {
  return (
    <SyncSaas
      history={history}
      queryParams={queryString.parse(location.search)}
    />
  );
};

const edit = ({ history, location, match }) => {
  return (
    <Detail
      _id={match.params.id}
      history={history}
      queryParams={queryString.parse(location.search)}
    />
  );
};

const add = ({ history, location }) => {
  return (
    <Detail
      history={history}
      queryParams={queryString.parse(location.search)}
    />
  );
};

const routes = () => {
  return (
    <React.Fragment>
      <Route path="/settings/sync-saas" exact component={syncsaas} />
      <Route path="/settings/sync-saas/edit/:id" exact component={edit} />
      <Route path="/settings/sync-saas/add" exact component={add} />
    </React.Fragment>
  );
};

export default routes;
