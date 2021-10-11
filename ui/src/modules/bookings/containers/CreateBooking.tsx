import React from 'react';
import { IRouterProps } from '../../common/types';
import Booking from '../components/Booking';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { mutations } from '../graphql';
import { AddBookingMutationResponse, IBooking } from '../types';
import { Alert } from 'modules/common/utils';
import { withRouter } from 'react-router';

type Props = {
  history: any;
} & IRouterProps &
  AddBookingMutationResponse;

type State = {
  loading: boolean;
  isReadyToSaveForm: boolean;
  doc?: IBooking;
};

class CreateBookingContainer extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      loading: false,
      isReadyToSaveForm: false
    };
  }

  render() {
    const { addBookingMutation, history } = this.props;

    const afterFormDbSave = id => {
      this.setState({ isReadyToSaveForm: false });

      if (this.state.doc) {
        addBookingMutation({
          variables: {
            ...this.state.doc,
            formId: id
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
            this.setState({ loading: false });
          });
      }
    };

    const save = doc => {
      this.setState({ loading: false, isReadyToSaveForm: true, doc });
    };

    const updatedProps = {
      ...this.props,
      isActionLoading: this.state.loading,
      save,
      afterFormDbSave,
      isReadyToSaveForm: this.state.isReadyToSaveForm
    };
    return <Booking {...updatedProps} />;
  }
}

export default compose(
  graphql<{}, AddBookingMutationResponse>(gql(mutations.bookingsAdd), {
    name: 'addBookingMutation'
  })
)(withRouter<Props>(CreateBookingContainer));
