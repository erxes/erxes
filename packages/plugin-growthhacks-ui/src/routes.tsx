import React from 'react';
import GrowthHackingRoutes from './growthHacks/routes';
import GrowthSettings from './settings/growthHacks/routes';

const routes = () => {
  return (
    <React.Fragment>
      <GrowthHackingRoutes />
      <GrowthSettings />
    </React.Fragment>
  );
};

export default routes;
