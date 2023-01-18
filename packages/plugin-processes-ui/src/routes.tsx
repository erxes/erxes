import React from 'react';
import JobRoutes from './job/routes';
import FlowRoutes from './flow/routes';
import WorkRoutes from './work/routes';
import OverallWorkRoutes from './overallWork/routes';

const routes = () => {
  return (
    <React.Fragment>
      <JobRoutes />
      <FlowRoutes />
      <WorkRoutes />
      <OverallWorkRoutes />
    </React.Fragment>
  );
};

export default routes;
