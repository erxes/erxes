import { getDefaultBoardAndPipelines } from 'modules/boards/utils';
import asyncComponent from 'modules/common/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Redirect, Route } from 'react-router-dom';

const GrowthHackBoard = asyncComponent(() =>
  import(/* webpackChunkName: "GrowthHackBoard" */ './components/GrowthHackBoard')
);

const GrowthHackDashBoard = asyncComponent(() =>
  import(/* webpackChunkName: "GrowthHackDashBoard" */ './containers/Dashboard/DashBoard')
);
const PriorityMatrix = asyncComponent(() =>
  import(/* webpackChunkName: "PriorityMatrix" */ './components/priorityMatrix/PriorityMatrix')
);

const EditableGrowthHackList = asyncComponent(() =>
  import(/* webpackChunkName: "EditableGrowthHackList" */ './containers/EditableGrowthHackList')
);

const WeightedScore = asyncComponent(() =>
  import(/* webpackChunkName: "WeightedScore" */ './components/weightedScore/WeightedScore')
);

const FunnelImpact = asyncComponent(() =>
  import(/* webpackChunkName: "FunnelImpact" */ './components/funnelImpact/FunnelImpact')
);

const growthHack = () => {
  return <Redirect to="/growthHack/dashboard" />;
};

const boards = ({ location }) => {
  const queryParams = queryString.parse(location.search);

  return <GrowthHackBoard queryParams={queryParams} />;
};

const dashBoard = ({ location }) => {
  const { defaultBoards } = getDefaultBoardAndPipelines();
  const queryParams = queryString.parse(location.search);

  const state = queryParams.state || '';

  return <GrowthHackDashBoard state={state} id={defaultBoards.growthHack} />;
};

const priorityMatrix = ({ location }) => {
  const queryParams = queryString.parse(location.search);

  return <PriorityMatrix queryParams={queryParams} />;
};

const weightedScore = ({ location }) => {
  const queryParams = queryString.parse(location.search);

  return (
    <EditableGrowthHackList
      queryParams={queryParams}
      component={WeightedScore}
    />
  );
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
        render={growthHack}
      />

      <Route
        key="/growthHack/board"
        exact={true}
        path="/growthHack/board"
        component={boards}
      />

      <Route
        key="/growthHack/dashboard"
        exact={true}
        path="/growthHack/dashboard"
        component={dashBoard}
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
        component={weightedScore}
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
