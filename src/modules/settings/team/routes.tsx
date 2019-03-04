import queryString from 'query-string';
import * as React from 'react';
import { Route } from 'react-router-dom';
import { UserConfirmation, UserDetail, UserList } from './containers';

const team = ({ history, location }) => {
  const queryParams = queryString.parse(location.search);
  return <UserList queryParams={queryParams} history={history} />;
};

const userDetail = ({ match, location }) => {
  const queryParams = queryString.parse(location.search);
  const id = match.params.id;

  return <UserDetail _id={id} queryParams={queryParams} />;
};

export const userConfirmation = ({ location }) => {
  const queryParams = queryString.parse(location.search);

  return <UserConfirmation queryParams={queryParams} />;
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
