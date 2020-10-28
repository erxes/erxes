import { getDefaultBoardAndPipelines } from 'modules/boards/utils';
import asyncComponent from 'modules/common/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Redirect, Route } from 'react-router-dom';

const Calendar = asyncComponent(() =>
  import(/* webpackChunkName: "Calendar" */ './components/calendar/Calendar')
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
  let dealsLink = '/deal/board';

  const { defaultBoards, defaultPipelines } = getDefaultBoardAndPipelines();

  const [defaultBoardId, defaultPipelineId] = [
    defaultBoards.deal,
    defaultPipelines.deal
  ];

  if (defaultBoardId && defaultPipelineId) {
    dealsLink = `/deal/board?id=${defaultBoardId}&pipelineId=${defaultPipelineId}`;
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

const conversion = ({ location }) => {
  const queryParams = queryString.parse(location.search);

  return <Conversation queryParams={queryParams} />;
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
    </React.Fragment>
  );
};

export default routes;
