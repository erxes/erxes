// import { getDefaultBoardAndPipelines } from 'modules/boards/utils';
import React from 'react';
import DealRoutes from './deals/routes';
import BoardSettings from './settings/boards/routes';

const routes = () => {
  return (
    <React.Fragment>
      <DealRoutes />
      <BoardSettings />
    </React.Fragment>
  );
};

export default routes;
