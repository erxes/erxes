import AppRoutes from './apps/routes';
import BrandsRoutes from './brands/routes';
import General from './general/routes';
import ImportHistory from './importExport/routes';
import MainRoutes from './main/routes';
import MarketplaceRoutes from './marketplace/routes';
import PermissionRoutes from './permissions/routes';
import ProfileRoutes from './profile/routes';
import React from 'react';
import { Route } from 'react-router-dom';
import TeamRoutes from './team/routes';

const routes = () => (
  <React.Fragment>
    <MainRoutes key="MainRoutes" />
    <BrandsRoutes key="BrandsRoutes" />
    <ProfileRoutes key="profile" />
    <General key="General" />
    <TeamRoutes key="team" />
    <ImportHistory key="ImportHistory" />
    <PermissionRoutes key="PermissionRoutes" />
    <AppRoutes key="AppRoutes" />
    <MarketplaceRoutes key="Store" />
  </React.Fragment>
);

const settingsRoute = () => <Route component={routes} />;

export default settingsRoute;
