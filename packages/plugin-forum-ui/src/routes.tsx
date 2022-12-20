import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import React from 'react';
import { Route } from 'react-router-dom';

const Layout = asyncComponent(() =>
  import(/* webpackChunkName: "List - Forums" */ './components/Layout')
);

const layout = ({ history }) => {
  return <Layout history={history} />;
};

const routes = () => {
  return <Route path="/forums" component={layout} />;
};

export default routes;
