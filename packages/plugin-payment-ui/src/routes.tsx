import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

import asyncComponent from '@erxes/ui/src/components/AsyncComponent';

const PaymentConfigStore = asyncComponent(() =>
  import(
    /* webpackChunkName: "List - PaymentConfigStore" */ './containers/PaymentConfigStore'
  )
);

const InvoiceList = asyncComponent(() =>
  import(
    /* webpackChunkName: "Navigation - Invoice List" */ './containers/InvoiceList'
  )
);

const paymentConfigStore = ({ location }) => {
  return (
    <PaymentConfigStore queryParams={queryString.parse(location.search)} />
  );
};

const emailDeliveryList = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);

  return <InvoiceList queryParams={queryParams} history={history} />;
};

const routes = () => {
  return (
    <React.Fragment>
      <Route path="/payments/" component={paymentConfigStore} />;
      <Route
        exact={true}
        path="/payment-invoices"
        component={emailDeliveryList}
      />
    </React.Fragment>
  );
};

export default routes;
