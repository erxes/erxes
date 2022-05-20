import { Route } from 'react-router-dom';
import queryString from 'query-string';
import React from 'react';

import asyncComponent from '../common/components/AsyncComponent';
import { POS_MODES } from '../constants';

const WaitingScreenContainer = asyncComponent(() =>
  import(/* webpackChunkName: "WaitingScreen" */ '../waiting/containers/Screen')
);

const WaitingScreen = ({ location }) => {
  const qp = queryString.parse(location.search);

  return <WaitingScreenContainer qp={qp} />;
};

const routes = () => {
  if (
    ![POS_MODES.POS, POS_MODES.WAITING].includes(
      localStorage.getItem('erxesPosMode') || ''
    )
  ) {
    return <></>;
  }

  return (
    <React.Fragment>
      <Route
        key="/waiting-screen"
        exact={true}
        path="/waiting-screen"
        component={WaitingScreen}
      />
    </React.Fragment>
  );
};

export default routes;
