import React from 'react';
import ChannelRoutes from './channels/routes';
import BrandRoutes from './brands/routes';
import ResponseTemplateRoutes from './responseTemplates/routes';

const routes = () => (
  <div>
    <ChannelRoutes />
    <BrandRoutes />
    <ResponseTemplateRoutes />
  </div>
);

export default routes;
