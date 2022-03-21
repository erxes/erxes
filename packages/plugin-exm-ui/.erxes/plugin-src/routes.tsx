import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import React from 'react';
import { Route } from 'react-router-dom';

const Home = asyncComponent(() =>
  import(/* webpackChunkName: "Plugin exm" */ './containers/Home')
);

const ExmRoutes = () => (
  <Route path="/erxes-plugin-exm/home" component={Home} />
);

export default ExmRoutes;
