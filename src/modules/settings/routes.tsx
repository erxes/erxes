import React from 'react';
import { Route } from 'react-router-dom';
import BoardRoutes from './boards/routes';
import BrandsRoutes from './brands/routes';
import ChannelsRoutes from './channels/routes';
import EmailRoutes from './email/routes';
import EmailTemplatesRoutes from './emailTemplates/routes';
import General from './general/routes';
import GrowthHackRoutes from './growthHacks/routes';
import ImportHistory from './importHistory/routes';
import IntegrationsRoutes from './integrations/routes';
import LogRoutes from './logs/routes';
import MainRoutes from './main/routes';
import PermissionRoutes from './permissions/routes';
import ProductService from './productService/routes';
import ProfileRoutes from './profile/routes';
import PropertiesRoutes from './properties/routes';
import ResponseTemplatesRoutes from './responseTemplates/routes';
import ScriptsRoutes from './scripts/routes';
import StatusRoutes from './status/routes';
import TeamRoutes from './team/routes';

const routes = () => (
  <React.Fragment>
    <MainRoutes key="MainRoutes" />
    <ChannelsRoutes key="ChannelsRoutes" />
    <BrandsRoutes key="BrandsRoutes" />
    <ResponseTemplatesRoutes key="ResponseTemplatesRoutes" />
    <ProfileRoutes key="profile" />
    <TeamRoutes key="team" />
    <EmailTemplatesRoutes key="EmailTemplatesRoutes" />
    <EmailRoutes key="EmailRoutes" />
    <ScriptsRoutes key="ScriptsRoutes" />
    <IntegrationsRoutes key="IntegrationsRoutes" />
    <BoardRoutes key="BoardRoutes" />
    <ProductService key="ProductService" />
    <General key="General" />
    <PropertiesRoutes key="PropertiesRoutes" />
    <ImportHistory key="ImportHistory" />
    <StatusRoutes key="StatusRoutes" />
    <PermissionRoutes key="PermissionRoutes" />
    <LogRoutes key="LogRoutes" />
    <GrowthHackRoutes key="GrowthHackRoutes" />
  </React.Fragment>
);

const settingsRoute = () => <Route component={routes} />;

export default settingsRoute;
