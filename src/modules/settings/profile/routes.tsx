import asyncComponent from 'modules/common/components/AsyncComponent';
import queryString from 'query-string';
import * as React from 'react';
import { Route } from 'react-router-dom';

const Profile = asyncComponent(() =>
  import(/* webpackChunkName: "Settings - Profile" */ './containers/Profile')
);

const profile = ({ location }) => {
  const queryParams = queryString.parse(location.search);
  return <Profile queryParams={queryParams} />;
};

const routes = () => (
  <React.Fragment>
    <Route path="/profile" exact={true} key="/profile" component={profile} />
  </React.Fragment>
);

export default routes;
