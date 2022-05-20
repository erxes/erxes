import { Route } from 'react-router-dom';
import queryString from 'query-string';

import asyncComponent from '../common/components/AsyncComponent';
import React from 'react';

const InvoiceListContainer = asyncComponent(() =>
  import(
    /* webpackChunkName: "InvoiceListContainer" */ '../qpay/containers/InvoiceListContainer'
  )
);

const InvoiceList = ({ location }) => {
  const qp = queryString.parse(location.search);

  return <InvoiceListContainer qp={qp} />;
};

const routes = () => {
  return (
    <React.Fragment>
      <Route
        key="/qpay-invoices"
        exact={true}
        path="/qpay-invoices"
        component={InvoiceList}
      />
    </React.Fragment>
  );
};

export default routes;
