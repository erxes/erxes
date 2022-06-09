import React from 'react';
import SalesPlansRoutes from './sales-plans/routes';
import SettingsRoutes from './settings/routes';

const routes = () => {
  return (
    <>
      <SalesPlansRoutes />
      <SettingsRoutes />
    </>
  );
};

export default routes;
