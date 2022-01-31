import asyncComponent from 'modules/common/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const UserDetail = asyncComponent(() =>
  import(
    /* webpackChunkName: "Settings - UserDetail" */ './containers/UserDetailForm'
  )
);

const Home = asyncComponent(() =>
  import(/* webpackChunkName: "Settings - Home" */ './containers/Home')
);

const team = ({ history, location }) => {
  const queryParams = queryString.parse(location.search);
  return <Home queryParams={queryParams} history={history} />;
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
  </React.Fragment>
);

export default routes;
