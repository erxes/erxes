import React from 'react';
import { Route } from 'react-router-dom';
import BrandsRoutes from './brands/routes';
import ChannelsRoutes from './channels/routes';
import DealRoutes from './deals/routes';
import EmailRoutes from './email/routes';
import EmailTemplatesRoutes from './emailTemplates/routes';
import General from './general/routes';
import ImportHistory from './importHistory/routes';
import IntegrationsRoutes from './integrations/routes';
import MainRoutes from './main/routes';
import ProductService from './productService/routes';
import PropertiesRoutes from './properties/routes';
import ResponseTemplatesRoutes from './responseTemplates/routes';
import TeamMembersRoutes from './team/routes';

const routes = () => [
  <MainRoutes key="MainRoutes" />,
  <ChannelsRoutes key="ChannelsRoutes" />,
  <BrandsRoutes key="BrandsRoutes" />,
  <ResponseTemplatesRoutes key="ResponseTemplatesRoutes" />,
  <EmailTemplatesRoutes key="EmailTemplatesRoutes" />,
  <TeamMembersRoutes key="TeamMembersRoutes" />,
  <EmailRoutes key="EmailRoutes" />,
  <IntegrationsRoutes key="IntegrationsRoutes" />,
  <DealRoutes key="DealRoutes" />,
  <ProductService key="ProductService" />,
  <General key="General" />,
  <PropertiesRoutes key="PropertiesRoutes" />,
  <ImportHistory key="ImportHistory" />
];

const settingsRoute = () => <Route component={routes} />;

export default settingsRoute;