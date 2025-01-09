import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import React from "react";
import { Route, Routes } from "react-router-dom";

const Home = asyncComponent(
  () =>
    import(/* webpackChunkName: "Settings - Board Home"  */ "./containers/Home")
);

const DealHome = () => {
  return <Home type="deal" title="Deal" />;
};

const routes = () => (
  <Routes>
    <Route path="/settings/boards/deal" element={<DealHome />} />
  </Routes>
);

export default routes;
