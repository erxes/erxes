import React from 'react';
import { Route } from 'react-router-dom';
import BoardRoutes from './boards/routes';
import BrandsRoutes from './brands/routes';
import CalendarRoutes from './calendars/routes';
import ChannelsRoutes from './channels/routes';
import ClientPortalRoutes from './clientPortal/routes';
import EmailDeliveryRoutes from './emailDelivery/routes';
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
import SkillsRoutes from './skills/routes';
import StatusRoutes from './status/routes';
import TeamRoutes from './team/routes';
import WebhookRoutes from './webhook/routes';
import SmsDeliveryRoutes from './smsDeliveries/routes';

const routes = () => (
  <React.Fragment>
    <MainRoutes key="MainRoutes" />
    <ChannelsRoutes key="ChannelsRoutes" />
    <BrandsRoutes key="BrandsRoutes" />
    <ResponseTemplatesRoutes key="ResponseTemplatesRoutes" />
    <ProfileRoutes key="profile" />
    <TeamRoutes key="team" />
    <EmailTemplatesRoutes key="EmailTemplatesRoutes" />
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
    <EmailDeliveryRoutes key="EmailDeliveryRoutes" />
    <GrowthHackRoutes key="GrowthHackRoutes" />
    <WebhookRoutes key="WebhookRoutes" />
    <CalendarRoutes key="CalendarRoutes" />
    <SkillsRoutes key="SkillsRoutes" />
    <ClientPortalRoutes key="ClientPortalRoutes" />
    <SmsDeliveryRoutes key="SmsDeliveryRoutes" />
  </React.Fragment>
);

const settingsRoute = () => <Route component={routes} />;

export default settingsRoute;
