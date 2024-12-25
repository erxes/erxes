import { Route, Routes, useLocation } from 'react-router-dom';

import queryString from 'query-string';
import React from 'react';
import SettingsContainer from './containers/Settings';

const List = () => {
  const location = useLocation();

  return <SettingsContainer queryParams={queryString.parse(location.search)} />;
};

const routes = () => {
  return (
    <Routes>
      <Route
        path="/settings/activedirectory"
        key="/settings/activedirectory"
        element={<List />}
      />
    </Routes>
  );
};

export default routes;
