import { createMemoryHistory } from 'history';
import * as React from 'react';
import { Router, Switch } from 'react-router-dom';

export const withRouter = (
  node: JSX.Element | null,
  {
    route = '/',
    history = createMemoryHistory({ initialEntries: [route] })
  } = {}
) => {
  return (
    <Router history={history}>
      <Switch>{node}</Switch>
    </Router>
  );
};
