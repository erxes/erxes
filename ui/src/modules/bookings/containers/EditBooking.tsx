import React from 'react';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { queries, mutations } from '../graphql';
import Booking from '../components/Booking';
import {
  BookingDetailQueryResponse,
  EditBookingMutationResponse,
  IBooking
} from '../types';
import { Alert } from 'modules/common/utils';
import { withRouter } from 'react-router';
import { IRouterProps } from 'modules/common/types';
import {
  EmailTemplatesQueryResponse,
  EmailTemplatesTotalCountQueryResponse
} from 'modules/settings/emailTemplates/containers/List';
import { queries as templatesQuery } from 'modules/settings/emailTemplates/graphql';

type Props = {
  queryParams: any;
  bookingId: string;
  history: any;
};

type FinalProps = {
  bookingDetailQuery: BookingDetailQueryResponse;
  emailTemplatesQuery: EmailTemplatesQueryResponse;
  emailTemplatesTotalCountQuery: EmailTemplatesTotalCountQueryResponse;
} & IRouterProps &
  Props &
  EditBookingMutationResponse;

type State = {
  loading: boolean;
  isReadyToSaveForm: boolean;
  doc?: IBooking;
};

class EditBookingContainer extends React.Component<FinalProps, State> {
  constructor(props: FinalProps) {
    super(props);

    this.state = {
      loading: false,
      isReadyToSaveForm: false
    };
  }

  render() {
    const {
      bookingDetailQuery,
      editBookingMutation,
      history,
      emailTemplatesQuery
    } = this.props;

    if (bookingDetailQuery.loading) {
      return null;
    }

    const bookingDetail = bookingDetailQuery.bookingDetail || [];

    const afterFormDbSave = id => {
      this.setState({ isReadyToSaveForm: false });

      if (this.state.doc) {
        editBookingMutation({
          variables: {
            _id: bookingDetail._id,
            formId: id,
            ...this.state.doc
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
      bookingDetail,
      isActionLoading: this.state.loading,
      save,
      afterFormDbSave,
      isReadyToSaveForm: this.state.isReadyToSaveForm,
      emailTemplates: emailTemplatesQuery.emailTemplates || []
    };

    return <Booking {...updatedProps} />;
  }
}

const commonOptions = () => ({
  refetchQueries: [
    { query: gql(queries.bookings) },
    { query: gql(queries.bookingsTotalCount) }
  ]
});

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
    options: commonOptions
  }),
  graphql(gql(templatesQuery.totalCount), {
    name: 'emailTemplatesTotalCountQuery'
  }),
  graphql<FinalProps, EmailTemplatesQueryResponse>(
    gql(templatesQuery.emailTemplates),
    {
      name: 'emailTemplatesQuery',
      options: ({ emailTemplatesTotalCountQuery }) => ({
        variables: {
          perPage: emailTemplatesTotalCountQuery.emailTemplatesTotalCount
        }
      })
    }
  )
)(withRouter(EditBookingContainer));
