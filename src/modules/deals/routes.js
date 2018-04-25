import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { Home } from './containers';

const routes = () => [
  <Route
    key="deals"
    exact
    path="/deals"
    render={() => <Redirect to="/deals/board" />}
  />,
  <Route key="deals/board" exact path="/deals/board" component={Home} />
];

export default routes;
