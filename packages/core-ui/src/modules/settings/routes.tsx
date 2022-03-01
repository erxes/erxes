import React from 'react';
import { Route } from 'react-router-dom';
import BrandsRoutes from './brands/routes';
import General from './general/routes';
import ImportHistory from './importExport/routes';
import MainRoutes from './main/routes';
import PermissionRoutes from './permissions/routes';
import ProfileRoutes from './profile/routes';
import PropertiesRoutes from './properties/routes';
import StatusRoutes from './status/routes';
import TeamRoutes from './team/routes';

const routes = () => (
  <React.Fragment>
    <MainRoutes key="MainRoutes" />
    <BrandsRoutes key="BrandsRoutes" />
    <ProfileRoutes key="profile" />
    <General key="General" />
    <PropertiesRoutes key="PropertiesRoutes" />
    <TeamRoutes key="team" />
    <ImportHistory key="ImportHistory" />
    <StatusRoutes key="StatusRoutes" />
    <PermissionRoutes key="PermissionRoutes" />
  </React.Fragment>
);

const settingsRoute = () => <Route component={routes} />;

export default settingsRoute;
