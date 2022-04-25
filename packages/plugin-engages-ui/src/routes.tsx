import React from "react";
import EngageRoutes from "./campaigns/routes";
import SmsDeliveriesRoutes from "@erxes/ui-settings/src/smsDeliveries/routes";

const routes = () => {
  return (
    <React.Fragment>
      <EngageRoutes />
      <SmsDeliveriesRoutes />
    </React.Fragment>
  );
};

export default routes;
