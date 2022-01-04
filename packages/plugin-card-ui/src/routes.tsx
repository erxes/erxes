// import { getDefaultBoardAndPipelines } from 'modules/boards/utils';
import React from "react";
import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import queryString from "query-string";
import { Redirect, Route } from "react-router-dom";

const DealBoard = asyncComponent(() =>
  import(/* webpackChunkName: "DealBoard" */ "./components/DealBoard")
);

const deals = () => {
  const dealsLink = "/deal/board";

  // const { defaultBoards, defaultPipelines } = getDefaultBoardAndPipelines();

  // const [defaultBoardId, defaultPipelineId] = [
  //   defaultBoards.deal,
  //   defaultPipelines.deal
  // ];

  // if (defaultBoardId && defaultPipelineId) {
  //   dealsLink = `/deal/board?id=${defaultBoardId}&pipelineId=${defaultPipelineId}`;
  // }

  return <Redirect to={dealsLink} />;
};

const boards = ({ location }) => {
  const queryParams = queryString.parse(location.search);

  return <DealBoard viewType="board" queryParams={queryParams} />;
};

const routes = () => {
  console.log("in rouuuteee");
  return (
    <React.Fragment>
      <Route key="deals" exact={true} path="/deal" render={deals} />

      <Route
        key="deals/board"
        exact={true}
        path="/deal/board"
        component={boards}
      />
    </React.Fragment>
  );
};

export default routes;
