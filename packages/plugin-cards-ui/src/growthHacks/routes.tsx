import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route, Routes, useLocation, Navigate } from 'react-router-dom';

const GrowthHackBoard = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "GrowthHackBoard" */ './components/GrowthHackBoard'
    ),
);

const GrowthHackHome = asyncComponent(
  () =>
    import(/* webpackChunkName: "GrowthHackHome" */ './containers/home/Home'),
);
const PriorityMatrix = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "PriorityMatrix" */ './components/priorityMatrix/PriorityMatrix'
    ),
);

const EditableGrowthHackList = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "EditableGrowthHackList" */ './containers/EditableGrowthHackList'
    ),
);

const WeightedScore = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "WeightedScore" */ './components/weightedScore/WeightedScore'
    ),
);

const FunnelImpact = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "FunnelImpact" */ './components/funnelImpact/FunnelImpact'
    ),
);

const GrowthHack = () => {
  const location = useLocation();
  const growthHacksLink = `/growthHack/home${location.search}`;

  return <Navigate replace to={growthHacksLink} />;
};

const Boards = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <GrowthHackBoard queryParams={queryParams} />;
};

const Home = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <GrowthHackHome queryParams={queryParams} />;
};

const PriorityMatrixComponent = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <PriorityMatrix queryParams={queryParams} />;
};

const WeightedScoreComponent = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return (
    <EditableGrowthHackList
      queryParams={queryParams}
      component={WeightedScore}
    />
  );
};

const FunnelImpactComponent = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <FunnelImpact queryParams={queryParams} />;
};

const routes = () => {
  return (
    <Routes>
      <Route key="/growthHack" path="/growthHack" element={<GrowthHack />} />

      <Route
        key="/growthHack/board"
        path="/growthHack/board"
        element={<Boards />}
      />

      <Route
        key="/growthHack/home"
        path="/growthHack/home"
        element={<Home />}
      />

      <Route
        key="/growthHack/priorityMatrix"
        path="/growthHack/priorityMatrix"
        element={<PriorityMatrixComponent />}
      />

      <Route
        key="/growthHack/weightedScore"
        path="/growthHack/weightedScore"
        element={<WeightedScoreComponent />}
      />

      <Route
        key="/growthHack/funnelImpact"
        path="/growthHack/funnelImpact"
        element={<FunnelImpactComponent />}
      />
    </Routes>
  );
};

export default routes;
