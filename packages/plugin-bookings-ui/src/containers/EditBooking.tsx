import React from 'react';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { queries, mutations } from '../graphql';
import Booking from '../components/Booking';
import {
  BookingIntegrationDetailQueryResponse,
  EditBookingIntegrationMutationResponse,
  EditBookingIntegrationMutationVariables,
  IBookingData
} from '../types';
import { Alert } from 'modules/common/utils';
import { withRouter } from 'react-router-dom';
import { IRouterProps } from 'modules/common/types';
import {
  EmailTemplatesQueryResponse,
  EmailTemplatesTotalCountQueryResponse
} from 'modules/settings/emailTemplates/containers/List';
import { queries as templatesQuery } from 'modules/settings/emailTemplates/graphql';
import { ILeadData } from 'modules/leads/types';
import { FieldsQueryResponse } from 'modules/settings/properties/types';
import { FIELDS_GROUPS_CONTENT_TYPES } from 'modules/settings/properties/constants';

type Props = {
  queryParams: any;
  contentTypeId: string;
  history: any;
};

type FinalProps = {
  integrationDetailQuery: BookingIntegrationDetailQueryResponse;
  emailTemplatesQuery: EmailTemplatesQueryResponse;
  emailTemplatesTotalCountQuery: EmailTemplatesTotalCountQueryResponse;
  fieldsQuery: FieldsQueryResponse;
} & IRouterProps &
  Props &
  EditBookingIntegrationMutationResponse;

type State = {
  loading: boolean;
  isReadyToSaveForm: boolean;
  doc?: {
    name: string;
    brandId: string;
    languageCode: string;
    leadData: ILeadData;
    channelIds?: string[];
    bookingData: IBookingData;
  };
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
      integrationDetailQuery,
      editIntegrationMutation,
      history,
      emailTemplatesQuery,
      fieldsQuery
    } = this.props;

    if (integrationDetailQuery.loading) {
      return null;
    }

    const integration = integrationDetailQuery.integrationDetail || {};

    const afterFormDbSave = (id: string) => {
      this.setState({ isReadyToSaveForm: false });

      if (this.state.doc) {
        editIntegrationMutation({
          variables: {
            _id: integration._id,
            formId: id,
            ...this.state.doc
          }
        })
          .then(() => {
            Alert.success('You successfully edited a booking');
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
      integration,
      isActionLoading: this.state.loading,
      save,
      afterFormDbSave,
      isReadyToSaveForm: this.state.isReadyToSaveForm,
      emailTemplates: emailTemplatesQuery.emailTemplates || [],
      productFields: fieldsQuery.fields || []
    };

    return <Booking {...updatedProps} />;
  }
}

const commonOptions = () => ({
  refetchQueries: [
    { query: gql(queries.integrations) },
    { query: gql(queries.integrationsTotalCount) }
  ]
});

export default compose(
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
  ),
  graphql<
    {},
    EditBookingIntegrationMutationResponse,
    EditBookingIntegrationMutationVariables
  >(gql(mutations.integrationsEditBooking), {
    name: 'editIntegrationMutation',
    options: commonOptions
  }),
  graphql<Props, BookingIntegrationDetailQueryResponse, { _id: string }>(
    gql(queries.integrationDetail),
    {
      name: 'integrationDetailQuery',
      options: ({ contentTypeId }) => ({
        fetchPolicy: 'cache-and-network',
        variables: {
          _id: contentTypeId
        }
      })
    }
  ),
  graphql<{}, FieldsQueryResponse, { contentType: string }>(
    gql(queries.fields),
    {
      name: 'fieldsQuery',
      options: () => ({
        variables: {
          contentType: FIELDS_GROUPS_CONTENT_TYPES.PRODUCT
        }
      })
    }
  )
)(withRouter(EditBookingContainer));
