import React from 'react';
import { Route } from 'react-router-dom';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';

const UserDetail = asyncComponent(() =>
  import(
    /* webpackChunkName: "Settings - UserDetail" */ '@erxes/ui/src/team/containers/UserDetailForm'
  )
);

const Home = asyncComponent(() =>
  import(/* webpackChunkName: "Settings - Home" */ './containers/Home')
);

const Structure = asyncComponent(() =>
  import(
    /* webpackChunkName: "Settings - Structure" */ './components/structure/Settings'
  )
);

const Branches = asyncComponent(() =>
  import(
    /* webpackChunkName: "Settings - Branches" */ './containers/branch/MainList'
  )
);

const Departments = asyncComponent(() =>
  import(
    /* webpackChunkName: "Settings - Departments" */ './containers/department/MainList'
  )
);

const Units = asyncComponent(() =>
  import(
    /* webpackChunkName: "Settings - Units" */ './containers/unit/MainList'
  )
);

const team = ({ history, location }) => {
  const queryParams = queryString.parse(location.search);

  return <Home queryParams={queryParams} history={history} />;
};

const structure = () => {
  return <Structure />;
};

const branches = ({ history, location }) => {
  const queryParams = queryString.parse(location.search);

  return <Branches queryParams={queryParams} history={history} />;
};

const departments = ({ history, location }) => {
  const queryParams = queryString.parse(location.search);

  return <Departments queryParams={queryParams} history={history} />;
};

const units = ({ history, location }) => {
  const queryParams = queryString.parse(location.search);

  return <Units queryParams={queryParams} history={history} />;
};
const userDetail = ({ match, location }) => {
  const queryParams = queryString.parse(location.search);
  const id = match.params.id;

  return <UserDetail _id={id} queryParams={queryParams} />;
};

const routes = () => (
  <React.Fragment>
    <Route
      path="/settings/team/"
      exact={true}
      key="/settings/team/"
      component={team}
    />

    <Route
      key="/settings/team/details/:id"
      exact={true}
      path="/settings/team/details/:id"
      component={userDetail}
    />

    <Route
      path="/settings/structure"
      exact={true}
      key="/settings/structure"
      component={structure}
    />
    <Route
      path="/settings/branches/"
      exact={true}
      key="/settings/branches/"
      component={branches}
    />
    <Route
      path="/settings/departments/"
      exact={true}
      key="/settings/departments/"
      component={departments}
    />
    <Route
      path="/settings/units/"
      exact={true}
      key="/settings/units/"
      component={units}
    />
  </React.Fragment>
);

export default routes;
