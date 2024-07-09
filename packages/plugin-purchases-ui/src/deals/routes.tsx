import { Route, Routes, useLocation } from "react-router-dom";

import { Navigate } from "react-router-dom";
import React from "react";
import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import { getDefaultBoardAndPipelines } from "@erxes/ui-sales/src/boards/utils";
import queryString from "query-string";

const Calendar = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Calendar" */ "@erxes/ui-sales/src/boards/components/Calendar"
    )
);

const DealColumn = asyncComponent(
  () =>
    import(/* webpackChunkName: "DealColumn" */ "./containers/CalendarColumn")
);

const DealMainActionBar = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "DealMainActionbar" */ "./components/DealMainActionBar"
    )
);

const DealBoard = asyncComponent(
  () => import(/* webpackChunkName: "DealBoard" */ "./components/DealBoard")
);

const Conversation = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Conversion" */ "./components/conversion/Conversion"
    )
);

const Deals = () => {
  let view = localStorage.getItem("dealView") || "board";
  let dealsLink = `/deal/${view}`;

  const { defaultBoards, defaultPipelines } = getDefaultBoardAndPipelines();

  const [defaultBoardId, defaultPipelineId] = [
    defaultBoards.deal,
    defaultPipelines.deal
  ];

  if (defaultBoardId && defaultPipelineId) {
    dealsLink = `/deal/${view}?id=${defaultBoardId}&pipelineId=${defaultPipelineId}`;
  }

  return <Navigate replace to={dealsLink} />;
};

const Boards = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <DealBoard viewType="board" queryParams={queryParams} />;
};

const Activity = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <DealBoard viewType="activity" queryParams={queryParams} />;
};

const CalendarComponent = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return (
    <Calendar
      type="deal"
      title="Deals"
      queryParams={queryParams}
      ItemColumnComponent={DealColumn}
      MainActionBarComponent={DealMainActionBar}
    />
  );
};

const List = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <DealBoard viewType="list" queryParams={queryParams} />;
};

const Chart = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <DealBoard viewType="chart" queryParams={queryParams} />;
};

const Gantt = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <DealBoard viewType="gantt" queryParams={queryParams} />;
};

const Conversion = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <Conversation queryParams={queryParams} />;
};

const Time = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <DealBoard viewType="time" queryParams={queryParams} />;
};

const routes = () => {
  return (
    <Routes>
      <Route key="deals" path="/deal" element={<Deals />} />

      <Route key="deals/board" path="/deal/board/*" element={<Boards />} />

      <Route
        key="deals/calendar"
        path="/deal/calendar"
        element={<CalendarComponent />}
      />

      <Route
        key="deals/conversion"
        path="/deal/conversion"
        element={<Conversion />}
      />

      <Route
        key="deals/activity"
        path="/deal/activity"
        element={<Activity />}
      />

      <Route key="deals/list" path="/deal/list" element={<List />} />

      <Route key="deals/chart" path="/deal/chart" element={<Chart />} />

      <Route key="deals/gantt" path="/deal/gantt" element={<Gantt />} />

      <Route key="deals/time" path="/deal/time" element={<Time />} />
    </Routes>
  );
};

export default routes;
