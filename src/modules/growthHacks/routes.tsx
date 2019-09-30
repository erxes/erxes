import { getDefaultBoardAndPipelines } from 'modules/boards/utils';
import asyncComponent from 'modules/common/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Redirect, Route } from 'react-router-dom';

const GrowthHackBoard = asyncComponent(() =>
  import(/* webpackChunkName: "GrowthHackBoard" */ './components/GrowthHackBoard')
);

const PriorityMatrix = asyncComponent(() =>
  import(/* webpackChunkName: "PriorityMatrix" */ './components/priorityMatrix/PriorityMatrix')
);

const WeightedScore = asyncComponent(() =>
  import(/* webpackChunkName: "WeightedScore" */ './containers/WeigthedScore')
);

const FunnelImpact = asyncComponent(() =>
  import(/* webpackChunkName: "FunnelImpact" */ './components/funnelImpact/FunnelImpact')
);

const growthHacks = () => {
  let link = '/growthHack/board';

  const { defaultBoards, defaultPipelines } = getDefaultBoardAndPipelines();

  const [defaultBoardId, defaultPipelineId] = [
    defaultBoards.growthHack,
    defaultPipelines.growthHack
  ];

  if (defaultBoardId && defaultPipelineId) {
    link = `/growthHack/board?id=${defaultBoardId}&pipelineId=${defaultPipelineId}`;
  }

  return <Redirect to={link} />;
};

const boards = ({ location }) => {
  const queryParams = queryString.parse(location.search);

  return <GrowthHackBoard queryParams={queryParams} />;
};

const priorityMatrix = ({ location }) => {
  const queryParams = queryString.parse(location.search);

  return <PriorityMatrix queryParams={queryParams} />;
};

const weightdScore = ({ location }) => {
  const queryParams = queryString.parse(location.search);

  return <WeightedScore queryParams={queryParams} />;
};

const funnelImpact = ({ location }) => {
  const queryParams = queryString.parse(location.search);

  return <FunnelImpact queryParams={queryParams} />;
};

const routes = () => {
  return (
    <>
      <Route
        key="/growthHack"
        exact={true}
        path="/growthHack"
        render={growthHacks}
      />

      <Route
        key="/growthHack/board"
        exact={true}
        path="/growthHack/board"
        component={boards}
      />

      <Route
        key="/growthHack/priorityMatrix"
        exact={true}
        path="/growthHack/priorityMatrix"
        component={priorityMatrix}
      />

      <Route
        key="/growthHack/weightedScore"
        exact={true}
        path="/growthHack/weightedScore"
        component={weightdScore}
      />

      <Route
        key="/growthHack/funnelImpact"
        exact={true}
        path="/growthHack/funnelImpact"
        component={funnelImpact}
      />
    </>
  );
};

export default routes;
