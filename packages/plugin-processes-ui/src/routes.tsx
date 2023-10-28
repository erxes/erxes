import React from 'react';
import JobRoutes from './job/routes';
import FlowRoutes from './flow/routes';
import WorkRoutes from './work/routes';
import OverallWorkRoutes from './overallWork/routes';
import PerformRoutes from './performs/routes';

const routes = () => {
  return (
    <React.Fragment>
      <JobRoutes />
      <FlowRoutes />
      <WorkRoutes />
      <OverallWorkRoutes />
      <PerformRoutes />
    </React.Fragment>
  );
};

export default routes;
