import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import React from 'react';
import { Route } from 'react-router-dom';

const Home = asyncComponent(
  () =>
    import(/* webpackChunkName: "Settings - Board Home"  */ './containers/Home')
);

const DealHome = () => {
  return <Home type="deal" title="Deal" />;
};

const routes = () => (
  <React.Fragment>
    <Route path="/settings/boards/deal" component={DealHome} />
  </React.Fragment>
);

export default routes;
