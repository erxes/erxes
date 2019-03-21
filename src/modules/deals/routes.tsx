import queryString from 'query-string';
import * as React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { Calendar, DealBoard } from './components';

const deals = () => {
  return <Redirect to="/deals/board" />;
};

const boards = ({ location }) => {
  const queryParams = queryString.parse(location.search);

  return <DealBoard queryParams={queryParams} />;
};

const calendar = ({ location }) => {
  const queryParams = queryString.parse(location.search);

  return <Calendar queryParams={queryParams} />;
};

const routes = () => {
  return (
    <React.Fragment>
      <Route key="deals" exact={true} path="/deals" render={deals} />

      <Route
        key="deals/board"
        exact={true}
        path="/deals/board"
        component={boards}
      />

      <Route
        key="deals/calendar"
        exact={true}
        path="/deals/calendar"
        component={calendar}
      />
    </React.Fragment>
  );
};

export default routes;
