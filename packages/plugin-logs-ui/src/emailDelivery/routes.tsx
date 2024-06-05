import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import * as React from 'react';
import { Route, Routes } from 'react-router-dom';
import { useLocation, useNavigate } from 'react-router-dom';

const EmailDeliveryList = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Settings - EmailDeliveryList" */ './containers/EmailDelivery'
    ),
);

const EmailDeliveryListComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = queryString.parse(location.search);

  return <EmailDeliveryList queryParams={queryParams} history={navigate} />;
};

const routes = () => (
  <Routes>
    <Route
      path="/settings/emailDelivery/"
      element={<EmailDeliveryListComponent />}
    />
  </Routes>
);

export default routes;
