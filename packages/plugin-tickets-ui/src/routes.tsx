// import { getDefaultBoardAndPipelines } from 'modules/boards/utils';
import React from 'react';
import TicketRoutes from './tickets/routes';
import BoardSettings from './settings/boards/routes';

const routes = () => {
  return (
    <React.Fragment>
      <TicketRoutes />
      <BoardSettings />
    </React.Fragment>
  );
};

export default routes;
