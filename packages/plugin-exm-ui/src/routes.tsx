import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import React from 'react';
import { Route } from 'react-router-dom';
import queryString from 'query-string';

const Home = asyncComponent(() =>
  import(/* webpackChunkName: "Plugin exm" */ './containers/Home')
);

const List = ({ history, location }) => {
  return (
    <Home history={history} queryParams={queryString.parse(location.search)} />
  );
};

const ExmRoutes = () => (
  <Route path="/erxes-plugin-exm/home" component={List} />
);

export default ExmRoutes;
