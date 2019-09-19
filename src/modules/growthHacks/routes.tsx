import { getDefaultBoardAndPipelines } from 'modules/boards/utils';
import asyncComponent from 'modules/common/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Redirect, Route } from 'react-router-dom';

const GrowthHackBoard = asyncComponent(() =>
  import(/* webpackChunkName: "GrowthHackBoard" */ './components/GrowthHackBoard')
);

const GrowthHackDashBoard = asyncComponent(() =>
  import(/* webpackChunkName: "GrowthHackDashBoard" */ './containers/DashBoard')
);

const growthHack = () => {
  return <Redirect to="/growthHack/dashboard" />;
};

const boards = ({ location }) => {
  const queryParams = queryString.parse(location.search);

  return <GrowthHackBoard queryParams={queryParams} />;
};

const dashBoard = () => {
  const { defaultBoards } = getDefaultBoardAndPipelines();

  return <GrowthHackDashBoard id={defaultBoards.growthHack} />;
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
    </>
  );
};

export default routes;
