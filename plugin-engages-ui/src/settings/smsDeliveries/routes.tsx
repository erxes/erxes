import { Route, Routes, useLocation } from "react-router-dom";

import React from "react";
import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import queryString from "query-string";

const Container = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Settings-SmsDeliveries" */ "./containers/SmsDeliveries"
    )
);

const SmsDeliveries = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <Container queryParams={queryParams} />;
};

const routes = () => (
  <Routes>
    <Route path="/settings/sms-deliveries/" element={<SmsDeliveries />} />
  </Routes>
);

export default routes;
