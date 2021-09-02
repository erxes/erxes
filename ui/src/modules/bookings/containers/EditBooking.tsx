import React from 'react';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { queries } from '../graphql';
import Booking from '../components/detail/Booking';
import { BookingDetailQueryResponse } from '../types';

type Props = {
  queryParams: any;
  bookingId: any;
};

type FinalProps = {
  bookingDetailQuery: BookingDetailQueryResponse;
} & Props;

function EditBooking(props: FinalProps) {
  const { bookingDetailQuery } = props;

  const bookingDetail = bookingDetailQuery.bookingDetail || [];

  const updatedProps = {
    ...props,
    bookingDetail
  };

  return <Booking {...updatedProps} />;
}

export default compose(
  graphql<Props, BookingDetailQueryResponse, { _id: string }>(
    gql(queries.bookingDetail),
    {
      name: 'bookingDetailQuery',
      options: ({ bookingId }) => ({
        variables: {
          _id: bookingId
        }
      })
    }
  )
)(EditBooking);
