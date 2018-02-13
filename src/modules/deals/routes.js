import React from 'react';
import { Route } from 'react-router-dom';
import { Home, Board } from './containers';

const routes = () => [
  <Route key="/deals/home" exact path="/deals" component={Home} />,
  <Route
    key="/deals/board"
    exact
    path="/deals/board/:id"
    component={({ match }) => {
      const id = match.params.id;

      return <Board id={id} />;
    }}
  />
];

export default routes;
