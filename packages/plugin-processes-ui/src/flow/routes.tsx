import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import queryString from "query-string";
import React from "react";
import { Route, Routes, useLocation, useParams } from "react-router-dom";

const ProductList = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Settings List - FlowService" */ "./containers/flow/FlowList"
    )
);

const Details = asyncComponent(
  () => import(/* webpackChunkName: "FlowForm" */ "./containers/forms/FlowForm")
);

const ProductService = () => {
  const location = useLocation();
  return <ProductList queryParams={queryString.parse(location.search)} />;
};

const Detail = () => {
  const { id } = useParams();
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <Details id={id} queryParams={queryParams} />;
};

const routes = () => {
  return (
    <Routes>
      <Route
        path="/processes/flows"
        key="/processes/flows"
        element={<ProductService />}
      />
      <Route
        key="/processes/flows/details/:id"
        path="/processes/flows/details/:id"
        element={<Detail />}
      />
    </Routes>
  );
};

export default routes;
