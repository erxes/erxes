import AppRoutes from './apps/routes';
import BrandsRoutes from './brands/routes';
import General from './general/routes';
import ImportHistory from './importExport/routes';
import MainRoutes from './main/routes';
import MarketplaceRoutes from './marketplace/routes';
import PermissionRoutes from './permissions/routes';
import PlanRoutes from '../saas/settings/plans/routes';
import ProfileRoutes from './profile/routes';
import React from 'react';
import TeamRoutes from './team/routes';

const SettingsRoute = () => (
  <>
    <MainRoutes key="MainRoutes" />
    <BrandsRoutes key="BrandsRoutes" />
    <ProfileRoutes key="profile" />
    <General key="General" />
    <TeamRoutes key="team" />
    <ImportHistory key="ImportHistory" />
    <PermissionRoutes key="PermissionRoutes" />
    <AppRoutes key="AppRoutes" />
    <PlanRoutes key="Plan" />
    <MarketplaceRoutes key="Store" />
  </>
);

export default SettingsRoute;
