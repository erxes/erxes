import asyncComponent from 'modules/common/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const Container = asyncComponent(() =>
  import(
    /* webpackChunkName: "Settings-SmsDeliveries" */ './containers/SmsDeliveries'
  )
);

const SmsDeliveries = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);

  return <Container queryParams={queryParams} history={history} />;
};

const routes = () => (
  <React.Fragment>
    <Route
      exact={true}
      path="/settings/sms-deliveries/"
      component={SmsDeliveries}
    />
  </React.Fragment>
);

export default routes;
