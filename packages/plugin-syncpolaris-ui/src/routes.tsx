import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const List = asyncComponent(() =>
  import(/* webpackChunkName: "List - Syncpolariss" */ './containers/List')
);

const syncpolariss = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);
  const { type } = queryParams;

  return <List typeId={type} history={history} />;
};

const routes = () => {
  return <Route path="/syncpolariss/" component={syncpolariss} />;
};

export default routes;
