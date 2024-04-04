import asyncComponent from '@erxes/ui/src/components/AsyncComponent';

import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const SipProvider = asyncComponent(
  () =>
    import(/* webpackChunkName: "Widget - Calls" */ './containers/SipProvider'),
);

const createConnection = ({ location, history, currentUser }) => {
  const queryParams = queryString.parse(location.search);
  const { type } = queryParams;

  return (
    <SipProvider typeId={type} history={history} currentUser={currentUser} />
  );
};

const routes = () => {
  return (
    <>
      <Route
        path="/calls/"
        component={(props) => createConnection({ ...props })}
      />
    </>
  );
};

export default routes;
