import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const List = asyncComponent(() =>
  import(/* webpackChunkName: "List - Tags" */ './containers/List')
);

const tags = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);

  const { type } = queryParams;

  return <List type={type} history={history} />;
};

const routes = () => {
  return <Route path="/tags/" component={tags} />;
};

export default routes;
