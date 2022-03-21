import React from 'react';
import EngageRoutes from './campaigns/routes';
import EmailDeliveryRoutes from '@erxes/ui-settings/src/emailDelivery/routes';
import SmsDeliveriesRoutes from '@erxes/ui-settings/src/smsDeliveries/routes';
import EmailTemplatesRoutes from '@erxes/ui-settings/src/emailTemplates/routes';

const routes = () => {
  return (
    <React.Fragment>
      <EngageRoutes />
      <EmailDeliveryRoutes />
      <SmsDeliveriesRoutes />
      <EmailTemplatesRoutes />
    </React.Fragment>
  );
};

export default routes;
