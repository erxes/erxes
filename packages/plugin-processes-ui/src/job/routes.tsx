import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import queryString from "query-string";
import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";

const ProductList = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Settings List - ProductService" */ "./containers/refer/List"
    )
);

const ProductService = () => {
  const location = useLocation();
  return <ProductList queryParams={queryString.parse(location.search)} />;
};

const routes = () => {
  return (
    <Routes>
      <Route
        path="/processes/jobs"
        key="/processes/jobs"
        element={<ProductService />}
      />
    </Routes>
  );
};

export default routes;
