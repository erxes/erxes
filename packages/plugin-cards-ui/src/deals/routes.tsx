import { getDefaultBoardAndPipelines } from '@erxes/ui-cards/src/boards/utils';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Redirect, Route } from 'react-router-dom';

const Calendar = asyncComponent(() =>
  import(
    /* webpackChunkName: "Calendar" */ '@erxes/ui-cards/src/boards/components/Calendar'
  )
);

const DealColumn = asyncComponent(() =>
  import(/* webpackChunkName: "DealColumn" */ './containers/CalendarColumn')
);

const DealMainActionBar = asyncComponent(() =>
  import(
    /* webpackChunkName: "DealMainActionbar" */ './components/DealMainActionBar'
  )
);

const DealBoard = asyncComponent(() =>
  import(/* webpackChunkName: "DealBoard" */ './components/DealBoard')
);

const Conversation = asyncComponent(() =>
  import(
    /* webpackChunkName: "Conversion" */ './components/conversion/Conversion'
  )
);

const deals = () => {
  let view = localStorage.getItem('dealView') || 'board';
  let dealsLink = `/deal/${view}`;

  const { defaultBoards, defaultPipelines } = getDefaultBoardAndPipelines();

  const [defaultBoardId, defaultPipelineId] = [
    defaultBoards.deal,
    defaultPipelines.deal
  ];

  if (defaultBoardId && defaultPipelineId) {
    dealsLink = `/deal/${view}?id=${defaultBoardId}&pipelineId=${defaultPipelineId}`;
  }

  return <Redirect to={dealsLink} />;
};

const boards = ({ location }) => {
  const queryParams = queryString.parse(location.search);

  return <DealBoard viewType="board" queryParams={queryParams} />;
};

const activity = ({ location }) => {
  const queryParams = queryString.parse(location.search);

  return <DealBoard viewType="activity" queryParams={queryParams} />;
};

const calendar = ({ location }) => {
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

const list = ({ location }) => {
  const queryParams = queryString.parse(location.search);

  return <DealBoard viewType="list" queryParams={queryParams} />;
};

const chart = ({ location }) => {
  const queryParams = queryString.parse(location.search);

  return <DealBoard viewType="chart" queryParams={queryParams} />;
};

const gantt = ({ location }) => {
  const queryParams = queryString.parse(location.search);

  return <DealBoard viewType="gantt" queryParams={queryParams} />;
};

const conversion = ({ location }) => {
  const queryParams = queryString.parse(location.search);

  return <Conversation queryParams={queryParams} />;
};

const time = ({ location }) => {
  const queryParams = queryString.parse(location.search);

  return <DealBoard viewType="time" queryParams={queryParams} />;
};

const routes = () => {
  return (
    <React.Fragment>
      <Route key="deals" exact={true} path="/deal" render={deals} />

      <Route
        key="deals/board"
        exact={true}
        path="/deal/board"
        component={boards}
      />

      <Route
        key="deals/calendar"
        exact={true}
        path="/deal/calendar"
        component={calendar}
      />

      <Route
        key="deals/conversion"
        exact={true}
        path="/deal/conversion"
        component={conversion}
      />

      <Route
        key="deals/activity"
        exact={true}
        path="/deal/activity"
        component={activity}
      />

      <Route key="deals/list" exact={true} path="/deal/list" component={list} />

      <Route
        key="deals/chart"
        exact={true}
        path="/deal/chart"
        component={chart}
      />

      <Route
        key="deals/gantt"
        exact={true}
        path="/deal/gantt"
        component={gantt}
      />

      <Route key="deals/time" exact={true} path="/deal/time" component={time} />
    </React.Fragment>
  );
};

export default routes;
