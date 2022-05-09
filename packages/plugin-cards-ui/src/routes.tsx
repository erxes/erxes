// import { getDefaultBoardAndPipelines } from 'modules/boards/utils';
import React from 'react';
import DealRoutes from './deals/routes';
import TaskRoutes from './tasks/routes';
import TicketRoutes from './tickets/routes';
import GrowthHackingRoutes from './growthHacks/routes';
import GrowthSettings from './settings/growthHacks/routes';
import BoardSettings from './settings/boards/routes';

const routes = () => {
  return (
    <React.Fragment>
      <TaskRoutes />
      <DealRoutes />
      <TicketRoutes />
      <GrowthHackingRoutes />
      <GrowthSettings />
      <BoardSettings />
    </React.Fragment>
  );
};

export default routes;
