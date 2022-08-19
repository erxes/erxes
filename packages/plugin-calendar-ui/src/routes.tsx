import React from 'react';
import CalendarRoutes from './calendar/routes';
import CalendarSettings from './settings/routes';

const routes = () => {
  return (
    <React.Fragment>
      <CalendarRoutes />
      <CalendarSettings />
    </React.Fragment>
  );
};

export default routes;
