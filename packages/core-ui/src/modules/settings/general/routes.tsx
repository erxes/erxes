import { Route, Routes } from "react-router-dom";

import React from "react";
import asyncComponent from "modules/common/components/AsyncComponent";

const GeneralSettings = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Settings List - General" */ "./containers/GeneralSettings"
    )
);

const routes = () => {
  return (
    <Routes>
      <Route path="/settings/general/" element={<GeneralSettings />} />
    </Routes>
  );
};

export default routes;
