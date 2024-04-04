import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

import asyncComponent from '@erxes/ui/src/components/AsyncComponent';

const PaymentStore = asyncComponent(() =>
  import(
    /* webpackChunkName: "List - PaymentStore" */ './containers/PaymentStore'
  )
);

const InvoiceList = asyncComponent(() =>
  import(
    /* webpackChunkName: "Navigation - Invoice List" */ './containers/invoice/List'
  )
);

const PaymentConfigList = asyncComponent(() =>
  import(
    /* webpackChunkName: "Navigation - Payment Config List" */ './containers/paymentConfig/List'
  )
);

const paymentStore = ({ location }) => {
  return <PaymentStore queryParams={queryString.parse(location.search)} />;
};

const invoiceList = history => {
  const { location } = history;
  const queryParams = queryString.parse(location.search);

  return <InvoiceList queryParams={queryParams} history={history} />;
};

const paymentConfigList = history => {
  const { location } = history;
  const queryParams = queryString.parse(location.search);

  return <PaymentConfigList queryParams={queryParams} history={history} />;
};

const routes = () => {
  return (
    <React.Fragment>
      <Route path="/settings/payments/" component={paymentStore} />
      <Route exact={true} path="/payment/invoices/" component={invoiceList} />
      <Route
        exact={true}
        path="/payment/configs/"
        component={paymentConfigList}
      />
    </React.Fragment>
  );
};

export default routes;
