// import { getDefaultBoardAndPipelines } from 'modules/boards/utils';
import React from "react";
import { Redirect, Route } from "react-router-dom";

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
  // const queryParams = queryString.parse(location.search);

  return <div>Hi, Deal122</div>;
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
