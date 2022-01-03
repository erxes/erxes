import { getDefaultBoardAndPipelines } from 'modules/boards/utils';
import asyncComponent from 'modules/common/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Redirect, Route } from 'react-router-dom';

const TaskBoard = asyncComponent(() =>
  import(/* webpackChunkName: "TaskBoard" */ './components/TaskBoard')
);

const Calendar = asyncComponent(() =>
  import(/* webpackChunkName: "Calendar" */ '../boards/components/Calendar')
);

const CalendarColumn = asyncComponent(() =>
  import(/* webpackChunkName: "CalendarColumn" */ './containers/CalendarColumn')
);

const MainActionBar = asyncComponent(() =>
  import(
    /* webpackChunkName: "MainActionBar" */ './components/TaskMainActionBar'
  )
);

const tasks = () => {
  let link = '/task/board';

  const { defaultBoards, defaultPipelines } = getDefaultBoardAndPipelines();

  const [defaultBoardId, defaultPipelineId] = [
    defaultBoards.task,
    defaultPipelines.task
  ];

  if (defaultBoardId && defaultPipelineId) {
    link = `/task/board?id=${defaultBoardId}&pipelineId=${defaultPipelineId}`;
  }

  return <Redirect to={link} />;
};

const charts = ({ location }) => {
  const queryParams = queryString.parse(location.search);

  return <TaskBoard viewType="chart" queryParams={queryParams} />;
};

const boards = ({ location }) => {
  const queryParams = queryString.parse(location.search);

  return <TaskBoard viewType="board" queryParams={queryParams} />;
};

const activity = ({ location }) => {
  const queryParams = queryString.parse(location.search);

  return <TaskBoard viewType="activity" queryParams={queryParams} />;
};

const gantt = ({ location }) => {
  const queryParams = queryString.parse(location.search);

  return <TaskBoard viewType="gantt" queryParams={queryParams} />;
};

const calendar = ({ location }) => {
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

const list = ({ location }) => {
  const queryParams = queryString.parse(location.search);

  return <TaskBoard viewType="list" queryParams={queryParams} />;
};

const routes = () => {
  return (
    <>
      <Route key="/task" exact={true} path="/task" render={tasks} />

      <Route
        key="task/gantt"
        exact={true}
        path="/task/gantt"
        component={gantt}
      />

      <Route
        key="/task/board"
        exact={true}
        path="/task/board"
        component={boards}
      />

      <Route
        key="task/calendar"
        exact={true}
        path="/task/calendar"
        component={calendar}
      />

      <Route
        key="task/chart"
        exact={true}
        path="/task/chart"
        component={charts}
      />

      <Route
        key="task/activity"
        exact={true}
        path="/task/activity"
        component={activity}
      />

      <Route key="task/list" exact={true} path="/task/list" component={list} />
    </>
  );
};

export default routes;
