import withCurrentUser from "@erxes/ui/src/auth/containers/withCurrentUser";
import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import { router } from "@erxes/ui/src/utils";
import queryString from "query-string";
import React, { useEffect } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";

const List = asyncComponent(
  () => import(/* webpackChunkName: "List - Timeclocks" */ "./containers/List")
);

const MainContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Set Approved as default for scheduleStatus
  useEffect(() => {
    router.setParams(navigate, location, { scheduleStatus: "Approved" });
  }, []);

  const queryParams = queryString.parse(location.search);
  const routePath = location.pathname.split("/").slice(-1)[0];

  return (
    <List
      searchFilter={location.search}
      queryParams={queryParams}
      route={routePath}
      location={location}
      navigate={navigate}
    />
  );
};

const routes = () => {
  return (
    <Routes>
      <Route path="/timeclocks/*" element={<MainContent />} />
    </Routes>
  );
};

export default withCurrentUser(routes);
