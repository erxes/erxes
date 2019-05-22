import asyncComponent from 'modules/common/components/AsyncComponent';
import {
  STORAGE_BOARD_KEY,
  STORAGE_PIPELINE_KEY
} from 'modules/deals/constants';
import queryString from 'query-string';
import * as React from 'react';
import { Redirect, Route } from 'react-router-dom';

const Calendar = asyncComponent(() =>
  import(/* webpackChunkName: "Calendar" */ './components/calendar/Calendar')
);

const DealBoard = asyncComponent(() =>
  import(/* webpackChunkName: "DealBoard" */ './components/DealBoard')
);

const deals = () => {
  let dealsLink = '/deal/board';

  const lastBoardId = localStorage.getItem(STORAGE_BOARD_KEY);
  const lastPipelineId = localStorage.getItem(STORAGE_PIPELINE_KEY);

  if (lastBoardId && lastPipelineId) {
    dealsLink = `/deal/board?id=${lastBoardId}&pipelineId=${lastPipelineId}`;
  }

  return <Redirect to={dealsLink} />;
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
    </React.Fragment>
  );
};

export default routes;
