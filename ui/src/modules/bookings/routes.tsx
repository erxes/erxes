import asyncComponent from 'modules/common/components/AsyncComponent';
import { Route } from 'react-router-dom';
import React from 'react';
import queryString from 'query-string';

const List = asyncComponent(() =>
  import(/* webpackChunkName: "Bookings" */ './containers/BookingList')
);

const EditBooking = asyncComponent(() =>
  import(/* webpackChunkName: "EditBooking" */ './containers/EditBooking')
);

const bookings = history => {
  const { location } = history;

  const queryParams = queryString.parse(location.search);

  return <List queryParams={queryParams} history={history} />;
};

const editBooking = ({ match, location }) => {
  const { bookingId } = match.params;

  const queryParams = queryString.parse(location.search);

  return <EditBooking bookingId={bookingId} queryParams={queryParams} />;
};

const routes = () => (
  <React.Fragment>
    <Route exact={true} key="/bookings" path="/bookings" component={bookings} />
    <Route
      exact={true}
      key="/bookings/edit/:bookingId"
      path="/bookings/edit/:bookingId"
      component={editBooking}
    />
  </React.Fragment>
);

export default routes;
