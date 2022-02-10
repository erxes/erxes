import React from 'react';
import EngageRoutes from './engages/routes';
import EmailDeliveryRoutes from './settings/emailDelivery/routes';

const routes = () => {
  return (
    <React.Fragment>
      <EngageRoutes />
      <EmailDeliveryRoutes />
    </React.Fragment>
  );
};

export default routes;
