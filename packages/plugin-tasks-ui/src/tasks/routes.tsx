import { Route, useLocation, Routes } from "react-router-dom";
import { Navigate } from "react-router-dom";

import React from "react";
import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import { getDefaultBoardAndPipelines } from "@erxes/ui-tasks/src/boards/utils";
import queryString from "query-string";

const TaskBoard = asyncComponent(
  () => import(/* webpackChunkName: "TaskBoard" */ "./components/TaskBoard")
);

const Calendar = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Calendar" */ "@erxes/ui-tasks/src/boards/components/Calendar"
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
      /* webpackChunkName: "MainActionBar" */ "./components/TaskMainActionBar"
    )
);

const Tasks = () => {
  let view = localStorage.getItem("taskView") || "board";
  let link = `/task/${view}`;

  const { defaultBoards, defaultPipelines } = getDefaultBoardAndPipelines();

  const [defaultBoardId, defaultPipelineId] = [
    defaultBoards.task,
    defaultPipelines.task
  ];

  if (defaultBoardId && defaultPipelineId) {
    link = `/task/${view}?id=${defaultBoardId}&pipelineId=${defaultPipelineId}`;
  }

  return <Navigate replace to={link} />;
};

const Charts = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <TaskBoard viewType="chart" queryParams={queryParams} />;
};

const Boards = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <TaskBoard viewType="board" queryParams={queryParams} />;
};

const Activity = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <TaskBoard viewType="activity" queryParams={queryParams} />;
};

const Gantt = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <TaskBoard viewType="gantt" queryParams={queryParams} />;
};

const CalendarComponent = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return (
    <Calendar
      type="task"
      title="Task"
      queryParams={queryParams}
      ItemColumnComponent={CalendarColumn}
      MainActionBarComponent={MainActionBar}
    />
  );
};

const List = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <TaskBoard viewType="list" queryParams={queryParams} />;
};

const Time = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <TaskBoard viewType="time" queryParams={queryParams} />;
};

const routes = () => {
  return (
    <Routes>
      <Route key="/task" path="/task" element={<Tasks />} />

      <Route key="task/gantt" path="/task/gantt" element={<Gantt />} />

      <Route key="/task/board" path="/task/board" element={<Boards />} />

      <Route
        key="task/calendar"
        path="/task/calendar"
        element={<CalendarComponent />}
      />

      <Route key="task/chart" path="/task/chart" element={<Charts />} />

      <Route key="task/activity" path="/task/activity" element={<Activity />} />

      <Route key="task/list" path="/task/list" element={<List />} />

      <Route key="task/time" path="/task/time" element={<Time />} />
    </Routes>
  );
};

export default routes;
