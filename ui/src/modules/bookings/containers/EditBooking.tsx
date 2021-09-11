import React, { useState } from 'react';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { queries, mutations } from '../graphql';
import Booking from '../components/Booking';
import {
  BookingDetailQueryResponse,
  EditBookingMutationResponse
} from '../types';
import { Alert } from 'modules/common/utils';
import { withRouter } from 'react-router';
import { IRouterProps } from 'modules/common/types';

type Props = {
  queryParams: any;
  bookingId: string;
  history: any;
};

type FinalProps = {
  bookingDetailQuery: BookingDetailQueryResponse;
} & IRouterProps &
  Props &
  EditBookingMutationResponse;

function EditBookingContainer(props: FinalProps) {
  const [loading, setLoading] = useState(false);
  const { bookingDetailQuery, editBookingMutation, history } = props;

  if (bookingDetailQuery.loading) {
    return null;
  }

  const bookingDetail = bookingDetailQuery.bookingDetail || [];

  const save = ({ name, description }) => {
    setLoading(true);

    editBookingMutation({
      variables: {
        _id: bookingDetail._id,
        name,
        description
      }
    })
      .then(() => {
        Alert.success('You successfully edited Booking.');
        history.push('/bookings');
      })
      .catch(e => {
        Alert.error(e.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const updatedProps = {
    ...props,
    bookingDetail,
    isActionLoading: loading,
    save
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
  ),
  graphql<{}, EditBookingMutationResponse>(gql(mutations.bookingsEdit), {
    name: 'editBookingMutation',
    options: () => ({
      refetchQueries: ['bookings']
    })
  })
)(withRouter(EditBookingContainer));
