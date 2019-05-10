import asyncComponent from 'modules/common/components/AsyncComponent';
import queryString from 'query-string';
import * as React from 'react';
import { Route } from 'react-router-dom';

const TicketBoard = asyncComponent(() =>
  import(/* webpackChunkName: "TicketBoard" */ './components/TicketBoard')
);

const boards = ({ location }) => {
  const queryParams = queryString.parse(location.search);

  return <TicketBoard queryParams={queryParams} />;
};

const routes = () => {
  return (
    <Route
      key="ticket/board"
      exact={true}
      path="/ticket/board"
      component={boards}
    />
  );
};

export default routes;
