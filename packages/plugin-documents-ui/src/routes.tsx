import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const List = asyncComponent(() =>
  import(/* webpackChunkName: "Settings - List Document" */ './containers/List')
);

const documents = ({ location, history }) => {
  return (
    <List queryParams={queryString.parse(location.search)} history={history} />
  );
};

const routes = () => (
  <>
    <Route path="/settings/documents/" exact={true} component={documents} />
  </>
);

export default routes;
