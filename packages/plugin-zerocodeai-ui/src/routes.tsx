import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import React from 'react';
import { Route } from 'react-router-dom';

const Config = asyncComponent(() =>
  import(/* webpackChunkName: "ZeroConfig" */ './containers/Config')
);

const Train = asyncComponent(() =>
  import(/* webpackChunkName: "ZeroTrain" */ './containers/Train')
);

const routes = () => {
  return (
    <>
      <Route path="/zerocodeai/train" exact={true} component={Train} />;
      <Route path="/zerocodeai/config" exact={true} component={Config} />;
    </>
  );
};

export default routes;
