import asyncComponent from 'modules/common/components/AsyncComponent';
import { Route } from 'react-router-dom';
import React from 'react';
import queryString from 'query-string';

const List = asyncComponent(() =>
  import(/* webpackChunkName: "Bookings" */ './containers/BookingList')
);

const CreateBooking = asyncComponent(() =>
  import(/* webpackChunkName: "CreateBooking" */ './containers/CreateBooking')
);

const EditBooking = asyncComponent(() =>
  import(/* webpackChunkName: "EditBooking" */ './containers/EditBooking')
);

const bookings = history => {
  const { location } = history;

  const queryParams = queryString.parse(location.search);

  return <List queryParams={queryParams} history={history} />;
};

const createBooking = () => {
  return <CreateBooking />;
};

const editBooking = ({ match, location }) => {
  const { contentTypeId } = match.params;

  const queryParams = queryString.parse(location.search);

  return (
    <EditBooking contentTypeId={contentTypeId} queryParams={queryParams} />
  );
};

const routes = () => (
  <React.Fragment>
    <Route exact={true} key="/bookings" path="/bookings" component={bookings} />
    <Route
      exact={true}
      key="/bookings/create"
      path="/bookings/create"
      component={createBooking}
    />
    <Route
      exact={true}
      key="/bookings/edit/:contentTypeId"
      path="/bookings/edit/:contentTypeId"
      component={editBooking}
    />
  </React.Fragment>
);

export default routes;
