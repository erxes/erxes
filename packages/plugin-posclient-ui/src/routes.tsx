import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import React from 'react';
import { Route } from 'react-router-dom';

const List = asyncComponent(() =>
  import(/* webpackChunkName: "List - Posclients" */ './containers/List')
);

const posclients = ({ history }) => {
  return <List history={history} />;
};

const routes = () => {
  return <Route path="/posclients/" component={posclients} />;
};

export default routes;
