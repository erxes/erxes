import { getDefaultBoardAndPipelines } from 'modules/boards/utils';
import asyncComponent from 'modules/common/components/AsyncComponent';
import queryString from 'query-string';
import * as React from 'react';
import { Redirect, Route } from 'react-router-dom';

const TicketBoard = asyncComponent(() =>
  import(/* webpackChunkName: "TicketBoard" */ './components/TicketBoard')
);

const tickets = () => {
  let link = '/inbox/ticket/board';

  const { defaultBoards, defaultPipelines } = getDefaultBoardAndPipelines();

  const [defaultBoardId, defaultPipelineId] = [
    defaultBoards.ticket,
    defaultPipelines.ticket
  ];

  if (defaultBoardId && defaultPipelineId) {
    link = `/inbox/ticket/board?id=${defaultBoardId}&pipelineId=${defaultPipelineId}`;
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
      <Route
        key="/inbox/ticket"
        exact={true}
        path="/inbox/ticket"
        render={tickets}
      />

      <Route
        key="/inbox/ticket/board"
        exact={true}
        path="/inbox/ticket/board"
        component={boards}
      />
    </>
  );
};

export default routes;
