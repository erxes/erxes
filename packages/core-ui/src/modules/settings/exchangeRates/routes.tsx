import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import React from 'react';
import asyncComponent from 'modules/common/components/AsyncComponent';
import queryString from 'query-string';

const ExchangeRates = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Exchange Rates - Settings" */ './containers/ExchangeRates'
    )
);

const ExchangeRatesComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = queryString.parse(location.search);

  return (
    <ExchangeRates
      location={location}
      queryParams={queryParams}
      navigate={navigate}
    />
  );
};

const routes = () => (
  <Routes>
    <Route
      path="/settings/exchangeRates/"
      element={<ExchangeRatesComponent />}
    />
  </Routes>
);

export default routes;
