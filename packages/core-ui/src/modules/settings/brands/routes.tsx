import { Route, Routes } from 'react-router-dom';

import React from 'react';
import asyncComponent from 'modules/common/components/AsyncComponent';

const Brands = asyncComponent(
  () =>
    import(/* webpackChunkName: "Brands - Settings" */ './containers/Brands'),
);

const routes = () => (
  <Routes>
    <Route path="/settings/brands/" element={Brands} />
  </Routes>
);

export default routes;
