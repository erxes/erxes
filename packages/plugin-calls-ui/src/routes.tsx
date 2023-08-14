import asyncComponent from '@erxes/ui/src/components/AsyncComponent';

import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const Widget = asyncComponent(() =>
  import(/* webpackChunkName: "Widget - Calls" */ './containers/Widget')
);

const IncomingCall = asyncComponent(() =>
  import(
    /* webpackChunkName: "IncomingCall - Calls" */ './containers/IncomingCall'
  )
);

const widget = ({ location, history, currentUser }) => {
  const queryParams = queryString.parse(location.search);
  const { type } = queryParams;

  return <Widget typeId={type} history={history} currentUser={currentUser} />;
};

const incomingCall = ({ currentUser }) => {
  return <IncomingCall currentUser={currentUser} />;
};

const routes = () => {
  return (
    <>
      <Route path="/calls/" component={props => widget({ ...props })} />
      <Route
        path="/incomingcalls/"
        component={props => incomingCall({ ...props })}
      />
    </>
  );
};

export default routes;
