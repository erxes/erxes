import React from 'react';
import EngageRoutes from './engages/routes';
import EmailDeliveryRoutes from '@erxes/ui-settings/src/emailDelivery/routes';
import SmsDeliveriesRoutes from '@erxes/ui-settings/src/smsDeliveries/routes';

const routes = () => {
  return (
    <React.Fragment>
      <EngageRoutes />
      <EmailDeliveryRoutes />
      <SmsDeliveriesRoutes />
    </React.Fragment>
  );
};

export default routes;
