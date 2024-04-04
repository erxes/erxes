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

const PurchaseColumn = asyncComponent(() =>
  import(/* webpackChunkName: "PurchaseColumn" */ './containers/CalendarColumn')
);

const PurchaseMainActionBar = asyncComponent(() =>
  import(
    /* webpackChunkName: "PurchaseMainActionbar" */ './components/PurchaseMainActionBar'
  )
);

const PurchaseBoard = asyncComponent(() =>
  import(/* webpackChunkName: "PurchaseBoard" */ './components/PurchaseBoard')
);

const Conversation = asyncComponent(() =>
  import(
    /* webpackChunkName: "Conversion" */ './components/conversion/Conversion'
  )
);

const purchases = () => {
  let view = localStorage.getItem('purchaseView') || 'board';
  let purchasesLink = `/purchase/${view}`;

  const { defaultBoards, defaultPipelines } = getDefaultBoardAndPipelines();

  const [defaultBoardId, defaultPipelineId] = [
    defaultBoards.purchase,
    defaultPipelines.purchase
  ];

  if (defaultBoardId && defaultPipelineId) {
    purchasesLink = `/purchase/${view}?id=${defaultBoardId}&pipelineId=${defaultPipelineId}`;
  }

  return <Redirect to={purchasesLink} />;
};

const boards = ({ location }) => {
  const queryParams = queryString.parse(location.search);

  return <PurchaseBoard viewType="board" queryParams={queryParams} />;
};

const activity = ({ location }) => {
  const queryParams = queryString.parse(location.search);

  return <PurchaseBoard viewType="activity" queryParams={queryParams} />;
};

const calendar = ({ location }) => {
  const queryParams = queryString.parse(location.search);

  return (
    <Calendar
      type="purchase"
      title="Purchases"
      queryParams={queryParams}
      ItemColumnComponent={PurchaseColumn}
      MainActionBarComponent={PurchaseMainActionBar}
    />
  );
};

const list = ({ location }) => {
  const queryParams = queryString.parse(location.search);

  return <PurchaseBoard viewType="list" queryParams={queryParams} />;
};

const chart = ({ location }) => {
  const queryParams = queryString.parse(location.search);

  return <PurchaseBoard viewType="chart" queryParams={queryParams} />;
};

const gantt = ({ location }) => {
  const queryParams = queryString.parse(location.search);

  return <PurchaseBoard viewType="gantt" queryParams={queryParams} />;
};

const conversion = ({ location }) => {
  const queryParams = queryString.parse(location.search);

  return <Conversation queryParams={queryParams} />;
};

const time = ({ location }) => {
  const queryParams = queryString.parse(location.search);

  return <PurchaseBoard viewType="time" queryParams={queryParams} />;
};

const routes = () => {
  return (
    <React.Fragment>
      <Route key="purchases" exact={true} path="/purchase" render={purchases} />

      <Route
        key="purchases/board"
        exact={true}
        path="/purchase/board"
        component={boards}
      />

      <Route
        key="purchases/calendar"
        exact={true}
        path="/purchase/calendar"
        component={calendar}
      />

      <Route
        key="purchases/conversion"
        exact={true}
        path="/purchase/conversion"
        component={conversion}
      />

      <Route
        key="purchases/activity"
        exact={true}
        path="/purchase/activity"
        component={activity}
      />

      <Route
        key="purchases/list"
        exact={true}
        path="/purchase/list"
        component={list}
      />

      <Route
        key="purchases/chart"
        exact={true}
        path="/purchase/chart"
        component={chart}
      />

      <Route
        key="purchases/gantt"
        exact={true}
        path="/purchase/gantt"
        component={gantt}
      />

      <Route
        key="purchases/time"
        exact={true}
        path="/purchase/time"
        component={time}
      />
    </React.Fragment>
  );
};

export default routes;
