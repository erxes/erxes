import { Route, Routes } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

import CarList from './containers/CarsList';
import React from 'react';
import queryString from 'query-string';

const List = () => {
  const location = useLocation();

  return <CarList queryParams={queryString.parse(location.search)} />;
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
