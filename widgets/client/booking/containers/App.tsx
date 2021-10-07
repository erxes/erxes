import * as React from 'react';
import { App } from '../components';
import { AppConsumer, AppProvider } from './AppContext';
import { ChildProps, graphql, compose } from 'react-apollo';
import { connection } from '../connection';
import gql from 'graphql-tag';
import { bookingDetail } from '../graphql';
import { IBooking } from '../types';

type QueryResponse = {
  widgetsBookingDetail: IBooking;
};

function AppContainer(props: ChildProps<{}, QueryResponse>) {
  const { data } = props;

  if (!data || data.loading || !data.widgetsBookingDetail) {
    return null;
  }

  const booking = data.widgetsBookingDetail;
  connection.data.booking = booking;

  return (
    <AppProvider>
      <AppConsumer>
        {({ activeRoute }) => {
          return <App activeRoute={activeRoute} booking={booking} />;
        }}
      </AppConsumer>
    </AppProvider>
  );
}

const BookingWithData = compose(
  graphql<{}, QueryResponse>(gql(bookingDetail), {
    options: () => ({
      variables: {
        _id: connection.setting.booking_id
      }
    })
  })
)(AppContainer);

export default BookingWithData;
