import { Route, Routes } from "react-router-dom";

import React from "react";
import asyncComponent from "modules/common/components/AsyncComponent";

const Settings = asyncComponent(
  () => import(/* webpackChunkName: "Settings" */ "./components/Settings")
);

const routes = () => (
  <Routes>
    <Route path="/settings" element={<Settings />} />
  </Routes>
);

export default routes;
