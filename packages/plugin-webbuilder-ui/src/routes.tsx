import { Route, Routes, useLocation, useParams } from "react-router-dom";

import React from "react";
import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import queryString from "query-string";

const SitesListContainer = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Websites - ListContainer" */ "./containers/templates/List"
    )
);

const SiteForm = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "SiteForm - XBuilders" */ "./containers/sites/SiteForm"
    )
);

const WebBuilderContainer = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "PageForm - XBuilderContainer" */ "./containers/Webbuilder"
    )
);

const WebBuilderSitesContainer = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);
  const { step } = useParams();

  return <WebBuilderContainer step={step} queryParams={queryParams} />;
};

const WebBuilderSitesCreate = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);
  const { step } = useParams();

  return <SitesListContainer step={step} queryParams={queryParams} />;
};

const WebBuilderSitesEdit = () => {
  const { _id } = useParams();
  const queryParams = queryString.parse(location.search);

  return <SiteForm _id={_id} queryParams={queryParams} />;
};

const routes = () => {
  return (
    <Routes>
      <Route path="/xbuilder" element={<WebBuilderSitesContainer />} />

      <Route
        path="/xbuilder/sites/create"
        element={<WebBuilderSitesCreate />}
      />

      <Route
        path="/xbuilder/sites/edit/:_id"
        element={<WebBuilderSitesEdit />}
      />
    </Routes>
  );
};

export default routes;
