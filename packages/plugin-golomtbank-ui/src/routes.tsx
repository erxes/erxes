import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import React from "react";
import queryString from "query-string";
import { Route, Routes, useLocation } from "react-router-dom";

const ConfigsList = asyncComponent(
  () => import(/* webpackChunkName: "ConfigList" */ "./configs/containers/List")
);
const GolomtbankAccounts = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Settings CreateGolomtbank" */ "./components/CorporateGateway"
    )
);

const ConfigsListComponent = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <ConfigsList queryParams={queryParams} />;
};
const MenuComponent = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <GolomtbankAccounts queryParams={queryParams} />;
};

const routes = () => {
  return (
    <Routes>
      <Route path="/settings/golomtBank" element={<ConfigsListComponent />} />
      <Route path="/golomtBank-corporate-gateway" element={<MenuComponent />} />
    </Routes>
  );
};

export default routes;
