import { getDefaultBoardAndPipelines } from "@erxes/ui-tickets/src/boards/utils";
import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import queryString from "query-string";
import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Navigate } from "react-router-dom";

const TicketBoard = asyncComponent(
  () => import(/* webpackChunkName: "TicketBoard" */ "./components/TicketBoard")
);

const Calendar = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Calendar" */ "@erxes/ui-tickets/src/boards/components/Calendar"
    )
);

const CalendarColumn = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "CalendarColumn" */ "./containers/CalendarColumn"
    )
);

const MainActionBar = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "MainActionBar" */ "./components/TicketMainActionBar"
    )
);

const Tickets = () => {
  let view = localStorage.getItem("ticketView") || "board";
  let link = `/ticket/${view}`;

  const { defaultBoards, defaultPipelines } = getDefaultBoardAndPipelines();

  const [defaultBoardId, defaultPipelineId] = [
    defaultBoards.ticket,
    defaultPipelines.ticket
  ];

  if (defaultBoardId && defaultPipelineId) {
    link = `/ticket/${view}?id=${defaultBoardId}&pipelineId=${defaultPipelineId}`;
  }

  return <Navigate replace to={link} />;
};

const Boards = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <TicketBoard viewType="board" queryParams={queryParams} />;
};

const CalendarComponent = () => {
  const location = useLocation();
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

const List = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <TicketBoard viewType="list" queryParams={queryParams} />;
};

const Chart = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <TicketBoard viewType="chart" queryParams={queryParams} />;
};

const Gantt = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <TicketBoard viewType="gantt" queryParams={queryParams} />;
};

const Activity = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <TicketBoard viewType="activity" queryParams={queryParams} />;
};

const Time = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <TicketBoard viewType="time" queryParams={queryParams} />;
};

const routes = () => {
  return (
    <Routes>
      <Route key="/ticket" path="/ticket" element={<Tickets />} />

      <Route key="/ticket/board" path="/ticket/board" element={<Boards />} />

      <Route
        key="/ticket/calendar"
        path="/ticket/calendar"
        element={<CalendarComponent />}
      />

      <Route key="ticket/list" path="/ticket/list" element={<List />} />

      <Route
        key="ticket/activity"
        path="/ticket/activity"
        element={<Activity />}
      />

      <Route key="ticket/chart" path="/ticket/chart" element={<Chart />} />

      <Route key="ticket/gantt" path="/ticket/gantt" element={<Gantt />} />

      <Route key="ticket/time" path="/ticket/time" element={<Time />} />
    </Routes>
  );
};

export default routes;
