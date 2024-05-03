import asyncComponent from '@erxes/ui/src/components/AsyncComponent';

import queryString from 'query-string';
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

const SipProvider = asyncComponent(
  () =>
    import(/* webpackChunkName: "Widget - Calls" */ './containers/SipProvider'),
);

const CreateConnection = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);
  const { type } = queryParams;

  return (
    <SipProvider typeId={type} />
  );
};

const routes = () => {
  return (
    <Routes>
      <Route
        path="/calls/"
        element={<CreateConnection />}
      />
    </Routes>
  );
};

export default routes;
