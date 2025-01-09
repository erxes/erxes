import { Route, Routes, useLocation, useParams } from "react-router-dom";

import React from "react";
import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import queryString from "query-string";

const UserDetail = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Settings - UserDetail" */ "@erxes/ui/src/team/containers/UserDetailForm"
    )
);

const Home = asyncComponent(
  () => import(/* webpackChunkName: "Settings - Home" */ "./containers/Home")
);

const Structure = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Settings - Structure" */ "./components/structure/Settings"
    )
);

const Branches = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Settings - Branches" */ "./containers/branch/MainList"
    )
);

const Departments = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Settings - Departments" */ "./containers/department/MainList"
    )
);

const Units = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Settings - Units" */ "./containers/unit/MainList"
    )
);

const Positions = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Settings - Positions" */ "./containers/position/MainList"
    )
);

const TeamComponent = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <Home queryParams={queryParams} />;
};

const BranchesComponent = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <Branches queryParams={queryParams} />;
};

const DepartmentsComponent = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <Departments queryParams={queryParams} />;
};

const UnitsComponent = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <Units queryParams={queryParams} />;
};

const UserDetailComponent = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);
  const { id } = useParams();

  return <UserDetail _id={id} queryParams={queryParams} />;
};

const PositionsComponent = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <Positions queryParams={queryParams} />;
};

const routes = () => (
  <Routes>
    <Route
      path="/settings/team/"
      key="/settings/team/"
      element={<TeamComponent />}
    />

    <Route
      key="/settings/team/details/:id"
      path="/settings/team/details/:id"
      element={<UserDetailComponent />}
    />

    <Route
      path="/settings/structure"
      key="/settings/structure"
      element={<Structure />}
    />
    <Route
      path="/settings/branches/"
      key="/settings/branches/"
      element={<BranchesComponent />}
    />
    <Route
      path="/settings/departments/"
      key="/settings/departments/"
      element={<DepartmentsComponent />}
    />
    <Route
      path="/settings/units/"
      key="/settings/units/"
      element={<UnitsComponent />}
    />
    <Route
      path="/settings/positions/"
      key="/settings/positions/"
      element={<PositionsComponent />}
    />
  </Routes>
);

export default routes;
