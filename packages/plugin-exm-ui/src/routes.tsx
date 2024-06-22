import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import React from "react";
import { Route, Routes } from "react-router-dom";

const Home = asyncComponent(
  () => import(/* webpackChunkName: "Plugin exm" */ "./containers/Home")
);

const ExmRoutes = () => (
  <Routes>
    <Route path="/erxes-plugin-exm/home" element={<Home />} />
  </Routes>
);

export default ExmRoutes;
