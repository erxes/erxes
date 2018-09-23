import queryString from 'query-string';
import * as React from 'react';
import { Route } from 'react-router-dom';
import { UserList } from './containers';
import { UserDetails } from './containers';

const routes = () => (
  <React.Fragment>
    <Route
      path="/settings/team/"
      exact
      key="/settings/team/"
      component={({ history, location }) => {
        const queryParams = queryString.parse(location.search);
        return <UserList queryParams={queryParams} history={history} />;
      }}
    />

    <Route
      key="/settings/team/details/:id"
      exact
      path="/settings/team/details/:id"
      component={({ match, location }) => {
        const queryParams = queryString.parse(location.search);
        const id = match.params.id;

        return <UserDetails id={id} queryParams={queryParams} />;
      }}
    />
  </React.Fragment>
);

export default routes;
