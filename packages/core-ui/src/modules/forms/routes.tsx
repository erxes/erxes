import asyncComponent from '@erxes/ui/src/components/AsyncComponent';

import queryString from 'query-string';
import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

const Properties = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Settings Properties" */ './containers/Properties'
    )
);

const FormsContainer = asyncComponent(
  () => import(/* webpackChunkName: "Forms" */ './containers/Forms')
);

const Forms = () => {
  return <FormsContainer />;
};

const PropertiesComp = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <Properties queryParams={queryParams} />;
};

const routes = () => (
  <Routes>
    <Route path='/settings/properties/' element={<PropertiesComp />} />
    <Route path='/forms/' element={<Forms />} />
  </Routes>
);

export default routes;
