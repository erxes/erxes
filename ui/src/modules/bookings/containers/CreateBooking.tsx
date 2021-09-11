import React, { useState } from 'react';
import { IRouterProps } from '../../common/types';
import Booking from '../components/Booking';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { mutations } from '../graphql';
import { AddBookingMutationResponse, IBooking } from '../types';
import { Alert } from 'modules/common/utils';
import { withRouter } from 'react-router';

type Props = {} & IRouterProps & AddBookingMutationResponse;

function CreateBookingContainer(props: Props) {
  const [loading, setLoading] = useState(false);

  const { addBookingMutation, history } = props;

  const save = ({ name, description }: IBooking) => {
    setLoading(true);
    addBookingMutation({
      variables: {
        name,
        description
      }
    })
      .then(() => {
        Alert.success('You successfully added a booking');
        history.push('/bookings');
      })

      .catch(error => {
        Alert.error(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const updatedProps = {
    ...props,
    isActionLoading: loading,
    save
  };
  return <Booking {...updatedProps} />;
}

export default compose(
  graphql<{}, AddBookingMutationResponse>(gql(mutations.bookingsAdd), {
    name: 'addBookingMutation',
    options: () => ({
      refetchQueries: ['bookings', 'bookingDetail']
    })
  })
)(withRouter<Props>(CreateBookingContainer));
