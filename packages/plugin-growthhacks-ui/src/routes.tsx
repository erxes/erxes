import React from 'react';
import GrowthHackingRoutes from './growthHacks/routes';
import GrowthSettings from './settings/growthHacks/routes';
import BoardSettings from './settings/boards/routes';

const routes = () => {
  return (
    <React.Fragment>
      <GrowthHackingRoutes />
      <GrowthSettings />
      <BoardSettings />
    </React.Fragment>
  );
};

export default routes;
