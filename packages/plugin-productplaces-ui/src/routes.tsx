import Settings from "./containers/Settings";
import React from "react";
import { Route, Routes } from "react-router-dom";
import asyncComponent from "@erxes/ui/src/components/AsyncComponent";

const StageSettings = asyncComponent(
  () =>
    import(/* webpackChunkName: "StageSettings" */ "./components/StageSettings")
);

const StageSetting = () => {
  return (
    <Settings component={StageSettings} configCode="dealsProductsDataPlaces" />
  );
};

const SplitSettings = asyncComponent(
  () =>
    import(/* webpackChunkName: "SplitSettings" */ "./components/SplitSettings")
);

const SplitSetting = () => {
  return (
    <Settings component={SplitSettings} configCode="dealsProductsDataSplit" />
  );
};

const PrintSettings = asyncComponent(
  () =>
    import(/* webpackChunkName: "PrintSettings" */ "./components/PrintSettings")
);

const PrintSetting = () => {
  return (
    <Settings component={PrintSettings} configCode="dealsProductsDataPrint" />
  );
};

const DefaultFilterSettings = asyncComponent(
  () =>
    import(/* webpackChunkName: "DefaultFilterSettings" */ "./components/DefaultFilterSettings")
);


const DefaultFilterSetting = () => {
  return (
    <Settings component={DefaultFilterSettings} configCode="dealsProductsDefaultFilter" />
  );
};

const routes = () => {
  return (
    <Routes>
      <Route
        key="/erxes-plugin-product-places/settings/stage"
        path="/erxes-plugin-product-places/settings/stage"
        element={<StageSetting />}
      />
      <Route
        key="/erxes-plugin-product-places/settings/split"
        path="/erxes-plugin-product-places/settings/split"
        element={<SplitSetting />}
      />
      <Route
        key="/erxes-plugin-product-places/settings/print"
        path="/erxes-plugin-product-places/settings/print"
        element={<PrintSetting />}
      />
      <Route
        key="/erxes-plugin-product-places/settings/productFilter"
        path="/erxes-plugin-product-places/settings/productFilter"
        element={<DefaultFilterSetting />}
      />
    </Routes>
  );
};

export default routes;
