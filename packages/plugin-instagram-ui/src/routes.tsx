import React from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import queryString from "query-string";

import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import { Authorization } from "./containers/Authorization";

const CreateInstagram = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Settings CreateInstagram" */ "./containers/Form"
    )
);

const CreateInstagramComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = queryString.parse(location.search);

  const callBack = () => {
    navigate("/settings/integrations/");
  };

  return <CreateInstagram callBack={callBack} kind={queryParams.kind} />;
};

const Auth = () => {
  const location = useLocation();
  return <Authorization queryParams={queryString.parse(location.search)} />;
};

const routes = () => (
  <Routes>
    <Route
      key="/settings/integrations/createInstagram"
      path="/settings/integrations/createInstagram"
      element={<CreateInstagramComponent />}
    />

    <Route
      key="/settings/ig-authorization"
      path="/settings/ig-authorization"
      element={<Auth />}
    />
  </Routes>
);

export default routes;
