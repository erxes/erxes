import {
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';

import React from 'react';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';

const UserDetail = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Settings - UserDetail" */ '@erxes/ui/src/team/containers/UserDetailForm'
    ),
);

const Home = asyncComponent(
  () => import(/* webpackChunkName: "Settings - Home" */ './containers/Home'),
);

const Structure = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Settings - Structure" */ './components/structure/Settings'
    ),
);

const Branches = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Settings - Branches" */ './containers/branch/MainList'
    ),
);

const Departments = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Settings - Departments" */ './containers/department/MainList'
    ),
);

const Units = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Settings - Units" */ './containers/unit/MainList'
    ),
);

const TeamComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = queryString.parse(location.search);

  return <Home queryParams={queryParams} history={navigate} />;
};

const BranchesComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = queryString.parse(location.search);

  return <Branches queryParams={queryParams} history={navigate} />;
};

const DepartmentsComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = queryString.parse(location.search);

  return <Departments queryParams={queryParams} history={navigate} />;
};

const UnitsComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = queryString.parse(location.search);

  return <Units queryParams={queryParams} history={navigate} />;
};
const UserDetailComponent = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);
  const { id } = useParams();

  return <UserDetail _id={id} queryParams={queryParams} />;
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
  </Routes>
);

export default routes;
