import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import React from 'react';
import { Route } from 'react-router-dom';

const Config = asyncComponent(() =>
  import(/* webpackChunkName: "ZeroConfig" */ './containers/Config')
);

const routes = () => {
  return <Route path="/zerocodeai/config" component={Config} />;
};

export default routes;
