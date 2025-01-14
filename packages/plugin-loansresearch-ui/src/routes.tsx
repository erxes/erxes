import { Route, Routes, useLocation, useParams } from 'react-router-dom';

import queryString from 'query-string';
import React from 'react';
import LoansResearchListContainer from './containers/LoansResearchListContainer';
import DetailsContainer from './containers/detail/LoansResearchDetails';

const LoansResearchListComponent = () => {
  const location = useLocation();

  return (
    <LoansResearchListContainer
      queryParams={queryString.parse(location.search)}
    />
  );
};

const LoansResearchDetails = () => {
  const { id } = useParams();

  return <DetailsContainer id={id || ''} />;
};

const routes = () => {
  return (
    <Routes>
      <Route
        key="/loansresearch"
        path="/loansresearch"
        element={<LoansResearchListComponent />}
      />

      <Route
        key="/loansresearch/details/:id"
        path="/loansresearch/details/:id"
        element={<LoansResearchDetails />}
      />
    </Routes>
  );
};

export default routes;
