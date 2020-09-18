import asyncComponent from 'modules/common/components/AsyncComponent';
import queryString from 'query-string';
import * as React from 'react';
import { Route } from 'react-router-dom';

const EmailDeliveryList = asyncComponent(() =>
  import(/* webpackChunkName: "Settings - EmailDeliveryList" */ './containers/EmailDelivery')
);

const emailDeliveryList = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);

  return <EmailDeliveryList queryParams={queryParams} history={history} />;
};

const routes = () => (
  <Route
    exact={true}
    path="/settings/emailDelivery/"
    component={emailDeliveryList}
  />
);

export default routes;
