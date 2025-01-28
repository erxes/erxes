import { Route, Routes, useLocation } from 'react-router-dom';

import queryString from 'query-string';
import React from 'react';
import LoansResearchListContainer from './containers/LoansResearchListContainer';

const LoansResearchListComponent = () => {
  const location = useLocation();

  return (
    <LoansResearchListContainer
      queryParams={queryString.parse(location.search)}
    />
  );
};

const routes = () => {
  return (
    <Routes>
      <Route
        key="/loansresearch"
        path="/loansresearch"
        element={<LoansResearchListComponent />}
      />
    </Routes>
  );
};

export default routes;
