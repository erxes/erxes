import React from 'react';
import JobRoutes from './job/routes';
import FlowRoutes from './flow/routes';

const routes = () => {
  return (
    <React.Fragment>
      <JobRoutes />
      <FlowRoutes />
    </React.Fragment>
  );
};

export default routes;
