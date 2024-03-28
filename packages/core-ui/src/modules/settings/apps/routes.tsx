import { Route, Routes } from "react-router-dom";

import React from "react";
import asyncComponent from "modules/common/components/AsyncComponent";

const Apps = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Apps - Settings" */ "./containers/AppListContainer"
    )
);

const routes = () => (
  <Routes>
    <Route path="/settings/apps/" element={<Apps />} />
  </Routes>
);

export default routes;
