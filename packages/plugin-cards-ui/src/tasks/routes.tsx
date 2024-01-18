import { Redirect, Route, useLocation } from 'react-router-dom';

import React from 'react';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import { getDefaultBoardAndPipelines } from '@erxes/ui-cards/src/boards/utils';
import queryString from 'query-string';

const TaskBoard = asyncComponent(
  () => import(/* webpackChunkName: "TaskBoard" */ './components/TaskBoard'),
);

const Calendar = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Calendar" */ '@erxes/ui-cards/src/boards/components/Calendar'
    ),
);

const CalendarColumn = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "CalendarColumn" */ './containers/CalendarColumn'
    ),
);

const MainActionBar = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "MainActionBar" */ './components/TaskMainActionBar'
    ),
);

const tasks = () => {
  let view = localStorage.getItem('taskView') || 'board';
  let link = `/task/${view}`;

  const { defaultBoards, defaultPipelines } = getDefaultBoardAndPipelines();

  const [defaultBoardId, defaultPipelineId] = [
    defaultBoards.task,
    defaultPipelines.task,
  ];

  if (defaultBoardId && defaultPipelineId) {
    link = `/task/${view}?id=${defaultBoardId}&pipelineId=${defaultPipelineId}`;
  }

  return <Redirect to={link} />;
};

const charts = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <TaskBoard viewType="chart" queryParams={queryParams} />;
};

const boards = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <TaskBoard viewType="board" queryParams={queryParams} />;
};

const activity = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <TaskBoard viewType="activity" queryParams={queryParams} />;
};

const gantt = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <TaskBoard viewType="gantt" queryParams={queryParams} />;
};

const calendar = () => {
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

const list = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <TaskBoard viewType="list" queryParams={queryParams} />;
};

const time = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <TaskBoard viewType="time" queryParams={queryParams} />;
};

const routes = () => {
  return (
    <>
      <Route key="/task" path="/task" render={tasks} />

      <Route key="task/gantt" path="/task/gantt" render={gantt} />

      <Route key="/task/board" path="/task/board" render={boards} />

      <Route key="task/calendar" path="/task/calendar" render={calendar} />

      <Route key="task/chart" path="/task/chart" render={charts} />

      <Route key="task/activity" path="/task/activity" render={activity} />

      <Route key="task/list" path="/task/list" render={list} />

      <Route key="task/time" path="/task/time" render={time} />
    </>
  );
};

export default routes;
