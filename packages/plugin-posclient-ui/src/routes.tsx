import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import React from 'react';
import { Route } from 'react-router-dom';

const List = asyncComponent(() =>
  import(/* webpackChunkName: "List - Clientposs" */ './containers/List')
);

const clientposs = ({ history }) => {
  return <List history={history} />;
};

const routes = () => {
  return <Route path="/clientposs/" component={clientposs} />;
};

export default routes;
