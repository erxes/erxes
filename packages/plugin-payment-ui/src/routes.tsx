import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import React from 'react';
import { Route } from 'react-router-dom';

const List = asyncComponent(() =>
  import(/* webpackChunkName: "List - Payments" */ './containers/List')
);

const payments = ({ history }) => {
  return <List history={history} />;
};

const routes = () => {
  return <Route path="/payments/" component={payments} />;
};

export default routes;
