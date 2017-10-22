import React from 'react';
import ChannelsRoutes from './channels/routes';
import BrandsRoutes from './brands/routes';
import ResponseTemplatesRoutes from './responseTemplates/routes';
import EmailTemplatesRoutes from './emailTemplates/routes';
import TeamMembersRoutes from './team/routes';
import EmailRoutes from './email/routes';
import FormsRoutes from './forms/routes';
import IntegrationsRoutes from './integrations/routes';
import { Main } from '../layout/styles';

const routes = () => (
  <Main>
    <ChannelsRoutes />
    <BrandsRoutes />
    <ResponseTemplatesRoutes />
    <EmailTemplatesRoutes />
    <TeamMembersRoutes />
    <EmailRoutes />
    <FormsRoutes />
    <IntegrationsRoutes />
  </Main>
);

export default routes;
