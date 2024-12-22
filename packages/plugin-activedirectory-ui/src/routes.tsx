import { Route, Routes } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

import React from 'react';
import queryString from 'query-string';
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
