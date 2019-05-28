import { getDefaultBoardAndPipelines } from 'modules/boards/utils';
import asyncComponent from 'modules/common/components/AsyncComponent';
import queryString from 'query-string';
import * as React from 'react';
import { Redirect, Route } from 'react-router-dom';

const TicketBoard = asyncComponent(() =>
  import(/* webpackChunkName: "TicketBoard" */ './components/TicketBoard')
);

const tickets = () => {
  let link = '/ticket/board';

  const { defaultBoards, defaultPipelines } = getDefaultBoardAndPipelines();

  const [defaultBoardId, defaultPipelineId] = [
    defaultBoards.ticket,
    defaultPipelines.ticket
  ];

  if (defaultBoardId && defaultPipelineId) {
    link = `/ticket/board?id=${defaultBoardId}&pipelineId=${defaultPipelineId}`;
  }

  return <Redirect to={link} />;
};

const boards = ({ location }) => {
  const queryParams = queryString.parse(location.search);

  return <TicketBoard queryParams={queryParams} />;
};

const routes = () => {
  return (
    <>
      <Route key="tickets" exact={true} path="/ticket" render={tickets} />

      <Route
        key="ticket/board"
        exact={true}
        path="/ticket/board"
        component={boards}
      />
    </>
  );
};

export default routes;
