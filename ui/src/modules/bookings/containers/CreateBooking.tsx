import React from 'react';
import { queries as templatesQuery } from 'modules/settings/emailTemplates/graphql';
import { IRouterProps } from '../../common/types';
import Booking from '../components/Booking';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { mutations } from '../graphql';
import {
  AddBookingIntegrationMutationResponse,
  AddBookingIntegrationMutationVariables,
  IBookingData
} from '../types';
import { Alert } from 'modules/common/utils';
import { withRouter } from 'react-router';
import {
  EmailTemplatesQueryResponse,
  EmailTemplatesTotalCountQueryResponse
} from 'modules/settings/emailTemplates/containers/List';
import { ILeadData } from 'modules/leads/types';
import { queries } from '../graphql';
import { FieldsQueryResponse } from 'modules/settings/properties/types';
import { FIELDS_GROUPS_CONTENT_TYPES } from 'modules/settings/properties/constants';

type Props = {
  history: any;
};

type FinalProps = {
  emailTemplatesQuery: EmailTemplatesQueryResponse;
  emailTemplatesTotalCountQuery: EmailTemplatesTotalCountQueryResponse;
  fieldsQuery: FieldsQueryResponse;
} & Props &
  IRouterProps &
  AddBookingIntegrationMutationResponse;

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

class CreateBookingContainer extends React.Component<FinalProps, State> {
  constructor(props: FinalProps) {
    super(props);

    this.state = {
      loading: false,
      isReadyToSaveForm: false
    };
  }

  render() {
    const {
      addIntegrationMutation,
      history,
      emailTemplatesQuery,
      fieldsQuery
    } = this.props;

    const afterFormDbSave = (id: string) => {
      this.setState({ isReadyToSaveForm: false });

      if (this.state.doc) {
        addIntegrationMutation({
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
      isReadyToSaveForm: this.state.isReadyToSaveForm,
      emailTemplates: emailTemplatesQuery.emailTemplates || [],
      productFields: fieldsQuery.fields || []
    };
    return <Booking {...updatedProps} />;
  }
}

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
    AddBookingIntegrationMutationResponse,
    AddBookingIntegrationMutationVariables
  >(gql(mutations.integrationsCreateBooking), {
    name: 'addIntegrationMutation'
  }),
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
)(withRouter<FinalProps>(CreateBookingContainer));
