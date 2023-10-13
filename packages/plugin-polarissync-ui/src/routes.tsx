import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import App from './App';
import React from 'react';
import { Route } from 'react-router-dom';

const Configs = asyncComponent(() =>
  import(/* webpackChunkName: "Navigation - Configs" */ './containers/Configs')
);

const configs = () => {
  return <Configs />;
};

const routes = () => {
  return <Route path="/polarissyncs/" component={configs} />;
};

export default routes;
