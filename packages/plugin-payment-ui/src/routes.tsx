import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import React from 'react';
import { Route } from 'react-router-dom';
import queryString from 'query-string';

const Store = asyncComponent(() =>
  import(/* webpackChunkName: "List - Store" */ './containers/Store')
);

const store = ({ location }) => {
  return <Store queryParams={queryString.parse(location.search)} />;
};

const PaymentSection = asyncComponent(() =>
  import(
    /* webpackChunkName: "Payment_options" */ './containers/PaymentSection'
  )
);

const paymentOptions = () => {
  return <PaymentSection queryParams={queryString.parse(location.search)} />;
};

const routes = () => {
  return (
    <React.Fragment>
      <Route path="/payments/" component={store} />;
      <Route path="/payment_options/" component={paymentOptions} />;
    </React.Fragment>
  );
};

export default routes;
