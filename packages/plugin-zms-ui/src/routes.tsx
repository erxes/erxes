import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const List = asyncComponent(() =>
  import(/* webpackChunkName: "List - Zmss" */ './containers/List')
);

const zmss = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);
  const { parentId } = queryParams;
  return <List parentId={parentId} history={history} />;
};

const routes = () => {
  return <Route path="/zmss/" component={zmss} />;
};

export default routes;
