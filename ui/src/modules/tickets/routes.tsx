import { getDefaultBoardAndPipelines } from 'modules/boards/utils';
import asyncComponent from 'modules/common/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Redirect, Route } from 'react-router-dom';

const TicketBoard = asyncComponent(() =>
  import(/* webpackChunkName: "TicketBoard" */ './components/TicketBoard')
);

const Calendar = asyncComponent(() =>
  import(/* webpackChunkName: "Calendar" */ '../boards/components/Calendar')
);

const CalendarColumn = asyncComponent(() =>
  import(/* webpackChunkName: "CalendarColumn" */ './containers/CalendarColumn')
);

const MainActionBar = asyncComponent(() =>
  import(
    /* webpackChunkName: "MainActionBar" */ './components/TicketMainActionBar'
  )
);

const tickets = () => {
  let link = '/ticket/board';

  const { defaultBoards, defaultPipelines } = getDefaultBoardAndPipelines();

  const [defaultBoardId, defaultPipelineId] = [
    defaultBoards.ticket,
    defaultPipelines.ticket
  ];

  if (defaultBoardId && defaultPipelineId) {
    link = `/ticket/board?id=${defaultBoardId}&pipelineId=${defaultPipelineId}`;
  }

  return <Redirect to={link} />;
};

const boards = ({ location }) => {
  const queryParams = queryString.parse(location.search);

  return <TicketBoard queryParams={queryParams} />;
};

const calendar = ({ location }) => {
  const queryParams = queryString.parse(location.search);

  return (
    <Calendar
      type="ticket"
      title="Ticket"
      queryParams={queryParams}
      ItemColumnComponent={CalendarColumn}
      MainActionBarComponent={MainActionBar}
    />
  );
};

const list = ({ location }) => {
  const queryParams = queryString.parse(location.search);

  return <TicketBoard viewType="list" queryParams={queryParams} />;
};

const activity = ({ location }) => {
  const queryParams = queryString.parse(location.search);

  return <TicketBoard viewType="activity" queryParams={queryParams} />;
};

const routes = () => {
  return (
    <>
      <Route key="/ticket" exact={true} path="/ticket" render={tickets} />

      <Route
        key="/ticket/board"
        exact={true}
        path="/ticket/board"
        component={boards}
      />

      <Route
        key="/ticket/calendar"
        exact={true}
        path="/ticket/calendar"
        component={calendar}
      />

      <Route
        key="ticket/list"
        exact={true}
        path="/ticket/list"
        component={list}
      />

      <Route
        key="ticket/activity"
        exact={true}
        path="/ticket/activity"
        component={activity}
      />
    </>
  );
};

export default routes;
