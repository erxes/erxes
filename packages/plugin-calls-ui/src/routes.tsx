import asyncComponent from '@erxes/ui/src/components/AsyncComponent';

import queryString from 'query-string';
import React from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

const SipProvider = asyncComponent(
  () =>
    import(/* webpackChunkName: "Widget - Calls" */ './containers/SipProvider'),
);

const Dashboard = asyncComponent(() => import('./components/Dashboard'));
const DashboardDetail = asyncComponent(
  () => import('./containers/switchboard/Detail'),
);

const CreateConnection = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);
  const { type } = queryParams;

  return <SipProvider typeId={type} />;
};

const ShowDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = queryString.parse(location.search);

  return (
    <Dashboard
      queryParams={queryParams}
      location={localStorage}
      navigate={navigate}
    />
  );
};

const ShowDashboardDetail = (queueList) => {
  return <DashboardDetail queueList={queueList} />;
};

const routes = () => {
  return (
    <Routes>
      <Route path="/calls/" element={<CreateConnection />} />
      <Route path="/calls/switchboard" element={<ShowDashboard />} />
      <Route
        path="/calls/switchboard/:queue"
        element={<ShowDashboardDetail />}
      />
    </Routes>
  );
};

export default routes;
