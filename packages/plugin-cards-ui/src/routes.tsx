import BoardSettings from './settings/boards/routes';
import DealRoutes from './deals/routes';
import GrowthHackingRoutes from './growthHacks/routes';
import GrowthSettings from './settings/growthHacks/routes';
import PurchaseRotes from './purchases/routes';
// import { getDefaultBoardAndPipelines } from 'modules/boards/utils';
import React from 'react';
import TaskRoutes from './tasks/routes';
import TicketRoutes from './tickets/routes';

const routes = () => {
  return (
    <>
      <TaskRoutes />
      <DealRoutes />
      <PurchaseRotes />
      <TicketRoutes />
      <GrowthHackingRoutes />
      <GrowthSettings />
      <BoardSettings />
    </>
  );
};

export default routes;
