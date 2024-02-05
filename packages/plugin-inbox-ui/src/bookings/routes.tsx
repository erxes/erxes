import { Route, Routes, useLocation, useParams } from 'react-router-dom';

import React from 'react';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';

const List = asyncComponent(
  () => import(/* webpackChunkName: "Bookings" */ './containers/BookingList'),
);

const CreateBooking = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "CreateBooking" */ './containers/CreateBooking'
    ),
);

const EditBooking = asyncComponent(
  () =>
    import(/* webpackChunkName: "EditBooking" */ './containers/EditBooking'),
);

const Bookings = (history) => {
  const { location } = history;

  const queryParams = queryString.parse(location.search);

  return <List queryParams={queryParams} history={history} />;
};

const EditBookingComponent = () => {
  const location = useLocation();
  const { contentTypeId } = useParams();

  const queryParams = queryString.parse(location.search);

  return (
    <EditBooking contentTypeId={contentTypeId} queryParams={queryParams} />
  );
};

const routes = () => (
  <Routes>
    <Route key="/bookings" path="/bookings" element={<Bookings />} />
    <Route
      key="/bookings/create"
      path="/bookings/create"
      element={<CreateBooking />}
    />
    <Route
      key="/bookings/edit/:contentTypeId"
      path="/bookings/edit/:contentTypeId"
      element={<EditBookingComponent />}
    />
  </Routes>
);

export default routes;
