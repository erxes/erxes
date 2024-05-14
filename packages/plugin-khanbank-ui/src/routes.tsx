import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import queryString from "query-string";
import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";

const ConfigsList = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "ConfigList" */ "./modules/configs/containers/List"
    )
);

const Menu = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Menu" */ "./modules/corporateGateway/components/CorporateGateway"
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

  return <Menu queryParams={queryParams} />;
};

const routes = () => {
  return (
    <Routes>
      <Route path="/settings/khanbank" element={<ConfigsListComponent />} />
      <Route path="/khanbank-corporate-gateway" element={<MenuComponent />} />
    </Routes>
  );
};

export default routes;
