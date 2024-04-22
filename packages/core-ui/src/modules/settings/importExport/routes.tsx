import { Route, Routes, useLocation } from "react-router-dom";

import React from "react";
import asyncComponent from "modules/common/components/AsyncComponent";
import queryString from "query-string";

const Import = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Form container" */ "./import/containers/FormContainer"
    )
);

const Export = asyncComponent(
  () =>
    import(/* webpackChunkName: "Form container" */ "./export/containers/Form")
);

const ImportHistories = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Settings Import Histories" */ "./import/containers/list/Histories"
    )
);
const ExportHistories = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Settings Export Histories" */ "./export/containers/Histories"
    )
);
const Menu = asyncComponent(
  () => import(/* webpackChunkName: "Settings Menu" */ "./SelectMenu")
);

const ImportForm = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <Import contentType={queryParams.type} />;
};
const ExportForm = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <Export contentType={queryParams.type} />;
};

const ImportHistoriesComponent = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <ImportHistories queryParams={queryParams} location={location} />;
};
const ExportHistoriesComponent = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <ExportHistories queryParams={queryParams} location={location} />;
};

const SelectMenu = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <Menu queryParams={queryParams} />;
};

const routes = () => {
  return (
    <Routes>
      <Route
        key="/settings/import"
        path="/settings/import"
        element={<ImportForm />}
      />
      <Route
        key="/settings/export"
        path="/settings/export"
        element={<ExportForm />}
      />

      <Route
        path="/settings/importHistories/"
        element={<ImportHistoriesComponent />}
      />
      <Route path="/settings/selectMenu/" element={<SelectMenu />} />
      <Route
        path="/settings/exportHistories"
        element={<ExportHistoriesComponent />}
      />
    </Routes>
  );
};

export default routes;
