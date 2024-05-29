import EngageRoutes from './campaigns/routes';
import React from 'react';
import SmsDeliveriesRoutes from './settings/smsDeliveries/routes';

const routes = () => {
  return (
    <React.Fragment>
      <EngageRoutes />
      <SmsDeliveriesRoutes />
    </React.Fragment>
  );
};

export default routes;
