import React from 'react';
import ChannelRoutes from './channels/routes';
import BrandRoutes from './brands/routes';
import ResponseTemplateRoutes from './responseTemplates/routes';
import TeamMemberRoutes from './team/routes';

const routes = () => (
  <div>
    <ChannelRoutes />
    <BrandRoutes />
    <ResponseTemplateRoutes />
    <TeamMemberRoutes />
  </div>
);

export default routes;
