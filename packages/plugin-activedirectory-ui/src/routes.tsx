import { Route, Routes, useLocation } from 'react-router-dom';

import queryString from 'query-string';
import React from 'react';
import SettingsContainer from './containers/Settings';
import SyncListContainer from './containers/SyncListContainer';

const List = () => {
  const location = useLocation();

  return <SettingsContainer queryParams={queryString.parse(location.search)} />;
};

const SyncAdListComponent = () => {
  const location = useLocation();

  return <SyncListContainer queryParams={queryString.parse(location.search)} />;
};

const routes = () => {
  return (
    <Routes>
      <Route
        path="/settings/activedirectory"
        key="/settings/activedirectory"
        element={<List />}
      />
      <Route
        key="/sync-activedirectory"
        path="/sync-activedirectory"
        element={<SyncAdListComponent />}
      />
    </Routes>
  );
};

export default routes;
