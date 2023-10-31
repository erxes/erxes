import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import React from 'react';
import { Route } from 'react-router-dom';
import queryString from 'query-string';

const List = asyncComponent(() =>
  import(/* webpackChunkName: "Plugin exm feed" */ './containers/Home')
);

const Home = ({ location, history }) => {
  return (
    <List queryParams={queryString.parse(location.search)} history={history} />
  );
};

const ExmRoutes = () => (
  <Route path="/erxes-plugin-exm-feed/home" component={Home} />
);

export default ExmRoutes;
