import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import React from 'react';
import { Route } from 'react-router-dom';

const List = asyncComponent(() =>
  import(/* webpackChunkName: "List - Tradings" */ './containers/List')
);

const tradings = ({ history }) => {
  return <List history={history} />;
};

const routes = () => {
  return <Route path="/tradings/" component={tradings} />;
};

export default routes;
