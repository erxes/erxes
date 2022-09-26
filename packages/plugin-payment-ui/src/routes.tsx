import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

import asyncComponent from '@erxes/ui/src/components/AsyncComponent';

const PaymentConfigStore = asyncComponent(() =>
  import(
    /* webpackChunkName: "List - PaymentConfigStore" */ './containers/PaymentConfigStore'
  )
);

const paymentConfigStore = ({ location }) => {
  return (
    <PaymentConfigStore queryParams={queryString.parse(location.search)} />
  );
};

const routes = () => {
  return (
    <React.Fragment>
      <Route path="/payments/" component={paymentConfigStore} />;
    </React.Fragment>
  );
};

export default routes;
