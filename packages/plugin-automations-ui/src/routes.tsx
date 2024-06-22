import { Route, Routes, useNavigate } from "react-router-dom";
import { useLocation, useParams } from "react-router-dom";

import React from "react";
import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import queryString from "query-string";

const GeneralSettings = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Automation General Settings" */ "./settings/general/containers"
    )
);

const BotsSettings = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Automation Bots Settings" */ "./settings/bots/containers"
    )
);

const Details = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "AutomationDetails" */ "./containers/forms/EditAutomation"
    )
);

const List = asyncComponent(
  () => import(/* webpackChunkName: "AutomationsList" */ "./containers/List")
);

const GeneralSettingsComponent = () => {
  const location = useLocation();
  return <GeneralSettings queryParams={queryString.parse(location.search)} />;
};

const BotsSettingsComponent = () => {
  const location = useLocation();
  return <BotsSettings queryParams={queryString.parse(location.search)} />;
};

const DetailsComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const queryParams = queryString.parse(location.search);

  return (
    <Details
      id={id}
      queryParams={queryParams}
      location={location}
      navigate={navigate}
    />
  );
};

const ListComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = queryString.parse(location.search);

  return (
    <List queryParams={queryParams} navigate={navigate} location={location} />
  );
};

const routes = () => {
  return (
    <Routes>
      <Route
        path="/settings/automations/general"
        element={<GeneralSettingsComponent />}
      />
      <Route
        path="/settings/automations/bots"
        element={<BotsSettingsComponent />}
      />

      <Route
        key="/automations/details/:id"
        path="/automations/details/:id"
        element={<DetailsComponent />}
      />
      <Route
        path="/automations"
        key="/automations"
        element={<ListComponent />}
      />
    </Routes>
  );
};

export default routes;
