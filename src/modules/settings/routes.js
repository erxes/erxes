import React from 'react';
import ChannelRoutes from './channels/routes';
import BrandRoutes from './brands/routes';
import ResponseTemplateRoutes from './responseTemplates/routes';
import EmailTemplateRoutes from './emailTemplates/routes';
import TeamMemberRoutes from './team/routes';
import EmailRoutes from './email/routes';

const routes = () => (
  <div>
    <ChannelRoutes />
    <BrandRoutes />
    <ResponseTemplateRoutes />
    <EmailTemplateRoutes />
    <TeamMemberRoutes />
    <EmailRoutes />
  </div>
);

export default routes;
