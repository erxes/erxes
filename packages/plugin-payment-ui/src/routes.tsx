import queryString from "query-string";
import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";

import asyncComponent from "@erxes/ui/src/components/AsyncComponent";

const PaymentStore = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "List - PaymentStore" */ "./containers/PaymentStore"
    )
);

const InvoiceList = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Navigation - Invoice List" */ "./containers/invoice/List"
    )
);

const PaymentConfigList = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Navigation - Payment Config List" */ "./containers/paymentConfig/List"
    )
);

const PaymentStoreComponent = () => {
  return <PaymentStore queryParams={queryString.parse(location.search)} />;
};

const InvoiceListComponent = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <InvoiceList queryParams={queryParams} />;
};

const PaymentConfigListComponent = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <PaymentConfigList queryParams={queryParams} />;
};

const routes = () => {
  return (
    <Routes>
      <Route path="/settings/payments/" element={<PaymentStoreComponent />} />
      <Route path="/payment/invoices/" element={<InvoiceListComponent />} />
      <Route
        path="/payment/configs/"
        element={<PaymentConfigListComponent />}
      />
    </Routes>
  );
};

export default routes;
