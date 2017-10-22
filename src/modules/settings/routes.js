import React from 'react';
import ChannelsRoutes from './channels/routes';
import BrandsRoutes from './brands/routes';
import ResponseTemplatesRoutes from './responseTemplates/routes';
import EmailTemplatesRoutes from './emailTemplates/routes';
import TeamMembersRoutes from './team/routes';
import EmailRoutes from './email/routes';
import FormsRoutes from './forms/routes';
import IntegrationsRoutes from './integrations/routes';

const routes = () => [
  <ChannelsRoutes key="ChannelsRoutes" />,
  <BrandsRoutes key="BrandsRoutes" />,
  <ResponseTemplatesRoutes key="ResponseTemplatesRoutes" />,
  <EmailTemplatesRoutes key="EmailTemplatesRoutes" />,
  <TeamMembersRoutes key="TeamMembersRoutes" />,
  <EmailRoutes key="EmailRoutes" />,
  <FormsRoutes key="FormsRoutes" />,
  <IntegrationsRoutes key="IntegrationsRoutes" />
];

export default routes;
