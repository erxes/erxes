import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import React from 'react';
import { Route } from 'react-router-dom';

const List = asyncComponent(() =>
  import(/* webpackChunkName: "List - {Name}s" */ './containers/List')
);

const {name}s = ({ history }) => {
  return <List history={history} />;
};

const routes = () => {
  return <Route path="/{name}s/" component={{name}s} />;
};

export default routes;
