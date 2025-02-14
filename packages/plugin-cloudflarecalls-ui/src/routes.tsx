import asyncComponent from '@erxes/ui/src/components/AsyncComponent';

import queryString from 'query-string';
import React from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

const RoomProvider = asyncComponent(
  () => import(/* webpackChunkName: "Widget - Calls" */ './containers/Room'),
);

const CreateConnection = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);
  const { type } = queryParams;

  return <RoomProvider typeId={type} />;
};

const routes = () => {
  return (
    <Routes>
      <Route path="/cloudflarecalls/" element={<CreateConnection />} />
    </Routes>
  );
};

export default routes;
