import { Route, Routes, useParams } from "react-router-dom";

import React from "react";
import asyncComponent from "@erxes/ui/src/components/AsyncComponent";

const Store = asyncComponent(
  () => import(/* webpackChunkName: "Store" */ "./containers/Store")
);

const PluginDetails = asyncComponent(
  () => import(/* webpackChunkName: "Store" */ "./containers/PluginDetails")
);

const Detail = () => {
  const { id } = useParams();

  return <PluginDetails id={id} />;
};

const routes = () => {
  return (
    <Routes>
      <Route
        key="/marketplace/details/:id"
        path="/marketplace/details/:id"
        element={<Detail />}
      />

      <Route path="/marketplace" key="/marketplace" element={<Store />} />
    </Routes>
  );
};

export default routes;
