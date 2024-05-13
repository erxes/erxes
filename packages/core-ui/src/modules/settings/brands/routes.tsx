import { Route, Routes, useLocation, useNavigate } from "react-router-dom";

import React from "react";
import asyncComponent from "modules/common/components/AsyncComponent";
import queryString from "query-string";

const Brands = asyncComponent(
  () =>
    import(/* webpackChunkName: "Brands - Settings" */ "./containers/Brands")
);

const BrandsComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = queryString.parse(location.search);

  return (
    <Brands location={location} queryParams={queryParams} navigate={navigate} />
  );
};

const routes = () => (
  <Routes>
    <Route path="/settings/brands/" element={<BrandsComponent />} />
  </Routes>
);

export default routes;
