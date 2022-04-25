import React from 'react';
import LogRoutes from './logs/routes';
import EmailDeliveryRoutes from './emailDelivery/routes';

const routes = () => {
  return (
    <React.Fragment>
      <LogRoutes />
      <EmailDeliveryRoutes />
    </React.Fragment>
  );
};

export default routes;