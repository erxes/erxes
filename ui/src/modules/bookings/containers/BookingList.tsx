import React, { useEffect } from 'react';
import { Alert, confirm } from 'modules/common/utils';
import Bulk from 'modules/common/components/Bulk';
import BookingList from '../components/BookingList';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { mutations, queries } from '../graphql';
import { generatePaginationParams } from 'modules/common/utils/router';
import {
  BookingsQueryResponse,
  CountQueryResponse,
  RemoveBookingMutationResponse,
  RemoveBookingMutationVariables
} from '../types';

type Props = {
  queryParams: any;
};

type FinalProps = {
  bookingsQuery: BookingsQueryResponse;
  bookingsTotalCountQuery: CountQueryResponse;
} & RemoveBookingMutationResponse &
  Props;

function BookingListContainer(props: FinalProps) {
  useEffect(() => {
    refetch();
  });

  const {
    bookingsQuery,
    bookingsRemoveMutation,
    bookingsTotalCountQuery
  } = props;

  const counts = bookingsTotalCountQuery
    ? bookingsTotalCountQuery.bookingsTotalCount
    : null;

  const totalCount = (counts && counts.total) || 0;

  const bookings = bookingsQuery.bookings || [];

  const remove = (bookingId: string) => {
    confirm().then(() => {
      bookingsRemoveMutation({
        variables: { _id: bookingId }
      })
        .then(() => {
          // refresh queries
          refetch();

          Alert.success('You successfully deleted a booking.');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    });
  };

  const refetch = () => {
    bookingsQuery.refetch();
    bookingsTotalCountQuery.refetch();
  };

  const updatedProps = {
    ...props,
    bookings,
    loading: bookingsQuery.loading,
    refetch,
    remove,
    counts,
    totalCount
  };

  // tslint:disable-next-line: no-shadowed-variable
  const content = props => {
    return <BookingList {...updatedProps} {...props} />;
  };

  return <Bulk content={content} refetch={refetch} />;
}

export default compose(
  graphql<
    Props,
    BookingsQueryResponse,
    { page?: number; perPage?: number; brandId?: string }
  >(gql(queries.bookings), {
    name: 'bookingsQuery',
    options: ({ queryParams }) => ({
      variables: {
        ...generatePaginationParams(queryParams),
        brandId: queryParams.brand,
        tagId: queryParams.tag,
        sortField: queryParams.sortField,
        sortDirection: queryParams.sortDirection
          ? parseInt(queryParams.sortDirection, 10)
          : undefined
      }
    })
  }),
  graphql<{}, RemoveBookingMutationResponse, RemoveBookingMutationVariables>(
    gql(mutations.bookingsRemove),
    {
      name: 'bookingsRemoveMutation'
    }
  ),
  graphql<Props, CountQueryResponse>(gql(queries.bookingsTotalCount), {
    name: 'bookingsTotalCountQuery'
  })
)(BookingListContainer);
