import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { Board } from './containers';

const routes = () => [
  <Route
    key="deals"
    exact
    path="/deals"
    render={() => <Redirect to="/deals/board" />}
  />,
  <Route key="deals/board" exact path="/deals/board" component={Board} />
];

export default routes;
