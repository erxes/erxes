import React from 'react';
import Booking from '../components/Booking';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { mutations } from '../graphql';
import {
  AddBookingMutationResponse,
  AddBookingMutationVariables
} from '../types';

type Props = {} & AddBookingMutationResponse;

function CreateBookingContainer(props: Props) {
  return <Booking />;
}

export default compose(
  graphql<{}, AddBookingMutationResponse, AddBookingMutationVariables>(
    gql(mutations.bookingsAdd),
    {
      name: 'addBookingMutation'
    }
  )
)(CreateBookingContainer);
