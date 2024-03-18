import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import React from 'react';
import { Route } from 'react-router-dom';

import { purchaseOptions } from './options';
const Home = asyncComponent(
  () =>
    import(/* webpackChunkName: "Settings - Board Home"  */ './containers/Home')
);

const PurchaseHome = () => {
  return <Home type="purchase" title="Purchase" options={purchaseOptions} />;
};

const routes = () => (
  <React.Fragment>
    <Route path="/settings/boards/purchase" component={PurchaseHome} />
  </React.Fragment>
);

export default routes;
