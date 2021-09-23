import * as React from 'react';
import { App } from '../components';
import { AppConsumer, AppProvider } from './AppContext';
import { ChildProps, graphql } from 'react-apollo';
import { connection } from '../connection';
import gql from 'graphql-tag';
import { bookingDetail } from '../graphql';
import { IBooking } from '../types';

type QueryResponse = {
  bookingDetail: IBooking;
};

function AppContainer(props: ChildProps<{}, QueryResponse>) {
  const { data } = props;

  if (!data || data.loading || !data.bookingDetail) {
    return null;
  }

  const booking = data.bookingDetail;

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

const BookingWithData = graphql<{}, QueryResponse>(gql(bookingDetail), {
  options: () => ({
    variables: {
      _id: connection.setting.booking_id
    }
  })
})(AppContainer);

export default BookingWithData;
