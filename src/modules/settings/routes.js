import React from 'react';
import { Route } from 'react-router-dom';
import ChannelsRoutes from './channels/routes';
import BrandsRoutes from './brands/routes';
import GeneralSettingsRoutes from './generalSettings/routes';
import ResponseTemplatesRoutes from './responseTemplates/routes';
import EmailTemplatesRoutes from './emailTemplates/routes';
import TeamMembersRoutes from './team/routes';
import EmailRoutes from './email/routes';
import FormsRoutes from './forms/routes';
import IntegrationsRoutes from './integrations/routes';
import ProfileRoutes from './profile/routes';
import MainRoutes from './main/routes';

const routes = () => [
  <MainRoutes key="MainRoutes" />,
  <GeneralSettingsRoutes key="GeneralSettingsRoutes" />,
  <ChannelsRoutes key="ChannelsRoutes" />,
  <BrandsRoutes key="BrandsRoutes" />,
  <ResponseTemplatesRoutes key="ResponseTemplatesRoutes" />,
  <EmailTemplatesRoutes key="EmailTemplatesRoutes" />,
  <TeamMembersRoutes key="TeamMembersRoutes" />,
  <EmailRoutes key="EmailRoutes" />,
  <FormsRoutes key="FormsRoutes" />,
  <IntegrationsRoutes key="IntegrationsRoutes" />,
  <ProfileRoutes key="ProfileRoutes" />
];

const settingsRoute = () => <Route path="/settings" component={routes} />;

export default settingsRoute;
