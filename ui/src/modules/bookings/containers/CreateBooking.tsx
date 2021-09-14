import React, { useState } from 'react';
import { IRouterProps } from '../../common/types';
import Booking from '../components/Booking';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { queries, mutations } from '../graphql';
import { AddBookingMutationResponse, IBooking, IStyle } from '../types';
import { Alert } from 'modules/common/utils';
import { withRouter } from 'react-router';

type Props = {} & IRouterProps & AddBookingMutationResponse;

function CreateBookingContainer(props: Props) {
  const [loading, setLoading] = useState(false);

  const { addBookingMutation, history } = props;

  const save = (doc: IBooking, styles: IStyle) => {
    setLoading(true);

    addBookingMutation({
      variables: {
        ...doc,
        styles: {
          ...styles
        }
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

const commonOptions = () => ({
  refetchQueries: [{ query: gql(queries.bookings) }]
});

export default compose(
  graphql<{}, AddBookingMutationResponse>(gql(mutations.bookingsAdd), {
    name: 'addBookingMutation',
    options: commonOptions
  })
)(withRouter<Props>(CreateBookingContainer));
