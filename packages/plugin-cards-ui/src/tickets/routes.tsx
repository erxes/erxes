import { getDefaultBoardAndPipelines } from '@erxes/ui-cards/src/boards/utils';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Redirect, Route } from 'react-router-dom';

const TicketBoard = asyncComponent(() =>
  import(/* webpackChunkName: "TicketBoard" */ './components/TicketBoard')
);

const Calendar = asyncComponent(() =>
  import(
    /* webpackChunkName: "Calendar" */ '@erxes/ui-cards/src/boards/components/Calendar'
  )
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
  let view = localStorage.getItem('ticketView') || 'board';
  let link = `/ticket/${view}`;

  const { defaultBoards, defaultPipelines } = getDefaultBoardAndPipelines();

  const [defaultBoardId, defaultPipelineId] = [
    defaultBoards.ticket,
    defaultPipelines.ticket
  ];

  if (defaultBoardId && defaultPipelineId) {
    link = `/ticket/${view}?id=${defaultBoardId}&pipelineId=${defaultPipelineId}`;
  }

  return <Redirect to={link} />;
};

const boards = ({ location }) => {
  const queryParams = queryString.parse(location.search);

  return <TicketBoard viewType="board" queryParams={queryParams} />;
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

const chart = ({ location }) => {
  const queryParams = queryString.parse(location.search);

  return <TicketBoard viewType="chart" queryParams={queryParams} />;
};

const gantt = ({ location }) => {
  const queryParams = queryString.parse(location.search);

  return <TicketBoard viewType="gantt" queryParams={queryParams} />;
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

      <Route
        key="ticket/chart"
        exact={true}
        path="/ticket/chart"
        component={chart}
      />

      <Route
        key="ticket/gantt"
        exact={true}
        path="/ticket/gantt"
        component={gantt}
      />
    </>
  );
};

export default routes;
