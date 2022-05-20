import { Route } from 'react-router-dom';
import queryString from 'query-string';
import React from 'react';

import asyncComponent from '../common/components/AsyncComponent';
import { POS_MODES } from '../constants';

const KitchenScreenContainer = asyncComponent(() =>
  import(/* webpackChunkName: "KitchenScreen" */ '../kitchen/containers/Screen')
);

const KitchenScreen = ({ location }) => {
  const qp = queryString.parse(location.search);

  return <KitchenScreenContainer qp={qp} />;
};

const routes = () => {
  if (
    ![POS_MODES.POS, POS_MODES.KITCHEN].includes(
      localStorage.getItem('erxesPosMode') || ''
    )
  ) {
    return <></>;
  }

  return (
    <React.Fragment>
      <Route
        key="/kitchen-screen"
        exact={true}
        path="/kitchen-screen"
        component={KitchenScreen}
      />
    </React.Fragment>
  );
};

export default routes;
