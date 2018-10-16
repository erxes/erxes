import queryString from 'query-string';
import * as React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { Home } from './containers';

const routes = () => (
  <React.Fragment>
    <Route
      key="deals"
      exact={true}
      path="/deals"
      render={() => <Redirect to="/deals/board" />}
    />

    <Route
      key="deals/board"
      exact={true}
      path="/deals/board"
      component={({ history, location }) => {
        const queryParams = queryString.parse(location.search);

        return <Home queryParams={queryParams} history={history} />;
      }}
    />
  </React.Fragment>
);

export default routes;
