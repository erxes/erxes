import React from 'react';
import JobRoutes from './job/routes';
import FlowRoutes from './flow/routes';
import PerformRoutes from './perform/routes';
import OverallWorkRoutes from './overallWork/routes';

const routes = () => {
  return (
    <React.Fragment>
      <JobRoutes />
      <FlowRoutes />
      <PerformRoutes />
      <OverallWorkRoutes />
    </React.Fragment>
  );
};

export default routes;
