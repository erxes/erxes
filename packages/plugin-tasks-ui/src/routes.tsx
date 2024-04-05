import React from 'react';
import TaskRoutes from './tasks/routes';
import BoardSettings from './settings/boards/routes';

const routes = () => {
  return (
    <React.Fragment>
      <TaskRoutes />
      <BoardSettings />
    </React.Fragment>
  );
};

export default routes;
