// import { getDefaultBoardAndPipelines } from 'modules/boards/utils';
import React from 'react';
import DealRoutes from './deals/routes';
import TaskRoutes from './tasks/routes';

const routes = () => {
  return (
    <React.Fragment>
      <DealRoutes />
      <TaskRoutes />
    </React.Fragment>
  );
};

export default routes;
