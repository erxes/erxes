import * as React from 'react';
import { Route } from 'react-router-dom';
import ChannelsRoutes from './channels/routes';
import BrandsRoutes from './brands/routes';
import ResponseTemplatesRoutes from './responseTemplates/routes';
import EmailTemplatesRoutes from './emailTemplates/routes';
import TeamMembersRoutes from './team/routes';
import EmailRoutes from './email/routes';
import IntegrationsRoutes from './integrations/routes';
import DealRoutes from './deals/routes';
import ProductService from './productService/routes';
import General from './general/routes';
import PropertiesRoutes from './properties/routes';
import ImportHistory from './importHistory/routes';
import MainRoutes from './main/routes';

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
